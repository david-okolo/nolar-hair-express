"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const booking_interface_1 = require("./interface/booking.interface");
const time_constants_1 = require("../utils/constants/time.constants");
const payment_service_1 = require("../payment/payment.service");
const mailer_service_1 = require("../mailer/mailer.service");
const booking_entity_1 = require("../entities/booking.entity");
const typeorm_1 = require("typeorm");
exports.createBooking = async (data) => {
    logger_1.logger.info(`Booking creation starting...`, JSON.stringify(data));
    const result = {
        created: false,
        paymentRequested: data.paidRequest,
        paymentInitialized: false,
        paymentUrl: null,
        reference: null,
        errors: []
    };
    const validity = await exports.timeSlotsAreValid([data.requestedAppointmentTime], data.requestedService).catch(e => {
        throw e;
    });
    let booking;
    if (validity.status) {
        booking = await typeorm_1.getRepository(booking_entity_1.Booking).save({
            name: data.name,
            email: data.email,
            requestedAppointmentTime: data.requestedAppointmentTime,
            service: data.requestedService,
            paidRequest: data.paidRequest
        }).catch(e => {
            result.errors.push('Error saving booking to database');
            logger_1.logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack);
        });
    }
    else {
        result.errors.push('Time slot has been taken');
        return result;
    }
    if (booking && data.paidRequest) {
        result.created = true;
        result.paymentInitialized = true;
        const start = process.hrtime();
        const payment = await payment_service_1.initializePayment({
            email: data.email,
            amount: Number(process.env.BOOKING_PRICE_IN_KOBO),
            booking: booking,
            reference: booking.reference
        }).catch(e => {
            result.errors.push(`Error initializing payment using '${'PAYSTACK'}'`);
            result.paymentInitialized = false;
            logger_1.logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack);
        });
        const end = process.hrtime(start);
        logger_1.logger.info(`Paystack API took ${((end[0] * 1e9) + end[1]) / 1e9} seconds to return data`);
        result.paymentUrl = payment ? payment.url : null;
        result.reference = payment ? payment.reference : null;
    }
    if (booking && result.created) {
        const message = {
            to: data.email,
            subject: 'Booking Request',
            viewName: 'bookingRequested',
            input: {
                recipientName: data.name,
                serviceRequested: data.requestedService,
                reference: booking.reference
            }
        };
        mailer_service_1.sendMail(message).then((response) => {
            logger_1.logger.info(`[Mail] response`, JSON.stringify(response));
        }).catch(e => {
            logger_1.logger.error(`[Mail] sending to ${data.email} failed`, e.stack);
        });
    }
    logger_1.logger.info(`Booking creation for 'email: ${data.email}' ending...`, JSON.stringify(result));
    return result;
};
exports.checkBooking = async (reference) => {
    const result = {
        email: '',
        paidRequest: false,
        paymentStatus: false,
        timeSlot: '',
        service: '',
        status: booking_interface_1.BookingStatus.failed,
        errors: []
    };
    await payment_service_1.verifyPayment(reference);
    // check database for booking by reference
    const booking = await typeorm_1.getRepository(booking_entity_1.Booking).findOne({
        reference: reference
    }, {
        relations: ['payment']
    }).catch(e => {
        logger_1.logger.error(e.message, e.stack);
    });
    if (!booking) {
        result.errors.push('Booking does not exist');
        return result;
    }
    // if entity has a paid value of true, check the payment table for the status of the transaction
    let date = Number(booking.requestedAppointmentTime);
    result.status = booking_interface_1.BookingStatus.pending;
    if (booking.approvedAppointmentTime) { // if the approved appointment time is set then the booking request has been approved by owner
        date = Number(booking.approvedAppointmentTime);
        result.status = booking_interface_1.BookingStatus.success;
    }
    result.email = booking.email;
    result.timeSlot = date.toString();
    result.service = booking.service;
    if (booking.paidRequest) {
        result.paidRequest = true;
        if (!booking.payment.verified || !booking.payment.success) {
            // if the transaction has not been verified or status is false, make a call to paystack to check
            const paymentVerified = await payment_service_1.verifyPayment(booking.reference).catch(e => {
                throw e;
            });
            if (paymentVerified) {
                result.paymentStatus = true;
            }
        }
        else {
            result.paymentStatus = true;
        }
    }
    return result;
};
exports.timeSlotsAreValid = async (timestamps, serviceName) => {
    // no paid or approved booking for the same service must have been made in that timeslot
    const result = await typeorm_1.getRepository(booking_entity_1.Booking).find({
        where: timestamps.map(timestamp => {
            return {
                requestedAppointmentTime: timestamp,
                service: serviceName
            };
        }),
        relations: ['payment']
    }).catch(e => {
        throw e;
    });
    return {
        status: result.length === 0,
        data: new Set(result.map(booking => {
            if (booking.payment && (booking.payment.success && booking.payment.verified)) {
                return Number(booking.approvedAppointmentTime ? booking.approvedAppointmentTime : booking.requestedAppointmentTime);
            }
            return 0;
        }))
    };
};
/**
* Returns time slots for a given period
* @param { number } period - number of days
*/
exports.getTimeSlotsByService = async (period, serviceName) => {
    // build object with keys as day timestamp (convert to date) and value as an array of tomestamps for start of slots
    const result = {};
    const today = new Date();
    for (let i = 1; i < period; i++) {
        const timeSlots = [];
        const dayOfTheMonth = today.getUTCDate();
        today.setUTCDate(dayOfTheMonth + (i === 0 ? 0 : 1));
        today.setUTCHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        if (today.getDay() > 0) { // 6 is the day code for sunday
            for (let j = time_constants_1.WORK_DAY_START_NORMAL; j < time_constants_1.WORK_DAY_END_NORMAL; j = j + time_constants_1.TIME_SLOT_INTERVAL) {
                today.setUTCHours(j, 0, 0, 0);
                if (today.getTime() > Date.now()) {
                    timeSlots.push(today.getTime());
                }
            }
        }
        else {
            for (let j = time_constants_1.WORK_DAY_START_SUNDAY; j < time_constants_1.WORK_DAY_END_SUNDAY; j = j + time_constants_1.TIME_SLOT_INTERVAL) {
                today.setUTCHours(j, 0, 0, 0);
                if (today.getTime() > Date.now()) {
                    timeSlots.push(today.getTime());
                }
            }
        }
        result[todayTimestamp] = timeSlots;
    }
    const allTimeSlots = Object.values(result).reduce((acc, curr) => { return [...acc, ...curr]; }, []);
    const validity = await exports.timeSlotsAreValid(allTimeSlots, serviceName).catch(e => {
        throw e;
    });
    if (!validity.status) {
        Object.entries(result).forEach(([key, value]) => {
            result[key] = value.filter(timeSlot => {
                return !validity.data.has(timeSlot);
            });
        });
    }
    return result;
};
// vulnerable
exports.update = async (data) => {
    const { id } = data, update = __rest(data, ["id"]);
    await typeorm_1.getRepository(booking_entity_1.Booking).update(id, update).catch(e => {
        logger_1.logger.error(`Updating booking id ${id}`, e.stack);
        throw new Error('Booking failed to update');
    });
    const booking = await typeorm_1.getRepository(booking_entity_1.Booking).findOne(id).catch(e => {
        logger_1.logger.error(`Updating booking id ${id}`);
    });
    if (booking) {
        const mail = {
            to: booking.email,
            subject: 'Booking Update',
            viewName: 'bookingUpdated',
            input: {
                recipientName: booking.name,
                reference: booking.reference
            }
        };
        mailer_service_1.sendMail(mail).then((response) => {
            logger_1.logger.info(`[Mail] response`, JSON.stringify(response));
        }).catch(e => {
            console.log(e);
            logger_1.logger.error(`[Mail] sending to ${booking.email} failed`, e.stack);
        });
    }
    return true;
};
//# sourceMappingURL=booking.service.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_service_1 = require("./booking.service");
const logger_1 = require("../utils/logger");
const time_constants_1 = require("../utils/constants/time.constants");
const passport_1 = __importDefault(require("passport"));
const router = express_1.Router();
router.post('/', async (req, res) => {
    const { body } = req;
    const response = {
        success: false,
        message: 'Booking Creation Failed',
        data: {
            payment: false,
            paymentLink: null,
            reference: null
        },
        errors: []
    };
    const result = await booking_service_1.createBooking(body).catch(e => {
        logger_1.logger.error(e.message, e.stack);
    });
    if (result) {
        response.errors = result.errors;
        if ((result.created && result.paymentInitialized) || (result.created && !result.paymentRequested)) {
            response.success = true;
            response.message = 'Booking Creation Successful';
        }
        if (result.created && result.paymentInitialized) {
            response.data.payment = result.paymentInitialized;
            response.data.paymentLink = result.paymentUrl;
            response.data.reference = result.reference;
        }
    }
    res.json(response);
});
router.post('/check', async (req, res) => {
    const { body } = req;
    const response = {
        success: true,
        message: 'Booking Check Successful',
        data: {},
        errors: []
    };
    const result = await booking_service_1.checkBooking(body.reference).catch((e) => {
        logger_1.logger.error(e.message, e.stack);
        response.errors.push(e.message);
    });
    if (!result || result.errors.length > 0) {
        response.success = false;
        response.message = 'Booking Check Failed';
        result ? response.errors.push(...result.errors) : response.errors;
        res.json(response);
        return;
    }
    response.data = Object.entries(result).reduce((acc, [key, val]) => {
        if (key !== 'errors') {
            acc[key] = val;
        }
        return acc;
    }, {});
    res.json(response);
});
router.post('/getTimeSlots', async (req, res) => {
    const { body } = req;
    const response = {
        success: false,
        message: 'Failed to fetch time slots',
        data: {},
        errors: []
    };
    const result = await booking_service_1.getTimeSlotsByService(time_constants_1.DEFAULT_PERIOD, body.serviceName).catch(e => {
        logger_1.logger.error(e.message, e.stack);
    });
    if (result) {
        response.success = true;
        response.message = 'Time slots fetched successfully';
        response.data = result;
    }
    res.json(response);
});
router.post('/edit', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    const { body } = req;
    await booking_service_1.update(body).catch(e => {
        res.status(400).send(e.message);
        return;
    });
    res.json({
        success: true,
        message: 'Booking Updated'
    });
});
exports.BookingRouter = router;
//# sourceMappingURL=booking.controller.js.map
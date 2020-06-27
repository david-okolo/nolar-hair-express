import { CreateBookingDto } from './dto/create-booking.dto';
import { logger } from '../utils/logger';
import { ICheckBookingResult, BookingStatus } from './interface/booking.interface';
import { WORK_DAY_START_NORMAL, WORK_DAY_END_NORMAL, TIME_SLOT_INTERVAL, WORK_DAY_START_SUNDAY, WORK_DAY_END_SUNDAY } from '../utils/constants';
import { initializePayment, verifyPayment } from '../payment/payment.service';
import { MailOptions } from '../mailer/interface/mailer.interface';
import { sendMail } from '../mailer/mailer.service';
import { Booking } from '../entities/booking.entity';
import { getRepository } from 'typeorm';

export const createBooking = async (data: CreateBookingDto) => {

  logger.info(`Booking creation starting...`, JSON.stringify(data));
  const result: any = {
      created: false,
      paymentRequested: data.paidRequest,
      paymentInitialized: false,
      paymentUrl: null,
      reference: null,
      errors: []
  }

  const validity = await timeSlotsAreValid([data.requestedAppointmentTime], data.requestedService).catch(e => {
      throw e;
  });

  let booking;

  if (validity.status) {
      booking = await getRepository(Booking).save({
          name: data.name,
          email: data.email,
          requestedAppointmentTime: data.requestedAppointmentTime,
          service: data.requestedService,
          paidRequest: data.paidRequest
      }).catch(e => {
          result.errors.push('Error saving booking to database');
          logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack)
      });
  } else {
      result.errors.push('Time slot has been taken');
      return result;
  }

  if(booking && data.paidRequest)
  {
      result.created = true;
      result.paymentInitialized = true;

      const start = process.hrtime();
      const payment = await initializePayment({
          email: data.email,
          amount: Number(process.env.BOOKING_PRICE_IN_KOBO),
          booking: booking,
          reference: booking.reference
      }).catch(e => {
          result.errors.push(`Error initializing payment using '${'PAYSTACK'}'`);
          result.paymentInitialized = false;
          logger.error(`Booking creation for 'email: ${data.email}' error - ${e.message}`, e.stack);
      })
      const end = process.hrtime(start);

      logger.info(`Paystack API took ${((end[0] * 1e9) + end[1])/1e9} seconds to return data`);

      result.paymentUrl = payment ? payment.url : null;
      result.reference = payment ? payment.reference : null;
  }

  if(booking && result.created) {

      const message: MailOptions = {
          to: data.email,
          subject: 'Booking Request',
          viewName: 'bookingRequested',
          input: {
              recipientName: data.name,
              serviceRequested: data.requestedService,
              reference: booking.reference
          }
      };
      
      sendMail(message).then((response) => {
          logger.info(`[Mail] response`, JSON.stringify(response));
      }).catch(e => {
          logger.error(`[Mail] sending to ${data.email} failed`, e.stack);
      });
  }

  logger.info(`Booking creation for 'email: ${data.email}' ending...`, JSON.stringify(result));

  return result;
}

export const checkBooking = async (reference: string): Promise<ICheckBookingResult> => {

  const result: ICheckBookingResult = {
      email: '',
      paidRequest: false,
      paymentStatus: false,
      timeSlot: '',
      service: '',
      status: BookingStatus.failed,
      errors: []
  }

  await verifyPayment(reference);

  // check database for booking by reference
  const booking = await getRepository(Booking).findOne(
      {
          reference: reference
      },
      { 
          relations: ['payment']
      }
  ).catch(e => {
      logger.error(e.message, e.stack)
  });

  if(!booking) {
      result.errors.push('Booking does not exist')
      return result;
  }

  // if entity has a paid value of true, check the payment table for the status of the transaction
  let date = Number(booking.requestedAppointmentTime);
  result.status = BookingStatus.pending;

  if(booking.approvedAppointmentTime) { // if the approved appointment time is set then the booking request has been approved by owner
      date = Number(booking.approvedAppointmentTime);
      result.status = BookingStatus.success
  }

  result.email = booking.email;
  result.timeSlot = date.toString();
  result.service = booking.service;

  if(booking.paidRequest) {
      result.paidRequest = true;

      if(!booking.payment.verified || !booking.payment.success) {
          // if the transaction has not been verified or status is false, make a call to paystack to check
          const paymentVerified = await verifyPayment(booking.reference).catch(e => {
              throw e;
          })

          if(paymentVerified) {
              result.paymentStatus = true;
          }
      } else {
          result.paymentStatus = true;
      }
  }

  return result;
}

export const timeSlotsAreValid = async (timestamps: number[], serviceName: string): Promise<any> => {
  // no paid or approved booking for the same service must have been made in that timeslot
  const result = await getRepository(Booking).find({ 
      where: timestamps.map(timestamp => {
          return {
              requestedAppointmentTime: timestamp,
              service: serviceName
          };
      }),
      relations: [ 'payment' ]
  }).catch(e => {
      throw e;
  });

  return {
      status: result.length === 0,
      data: new Set(result.map(booking => {
          if(booking.payment && (booking.payment.success && booking.payment.verified)) {
              return Number(booking.approvedAppointmentTime ? booking.approvedAppointmentTime : booking.requestedAppointmentTime);
          }

          return 0;
      }))
  }
}

/**
* Returns time slots for a given period
* @param { number } period - number of days
*/
export const getTimeSlotsByService = async (period: number, serviceName: string): Promise<any> => {
    // build object with keys as day timestamp (convert to date) and value as an array of tomestamps for start of slots
    const result: {
        [x: string]: Array<number>
    } = {};

    const today = new Date();

    for(let i = 1; i < period; i++) {

        const timeSlots: number[] = [];

        const dayOfTheMonth = today.getUTCDate();
        today.setUTCDate(dayOfTheMonth + (i === 0 ? 0 : 1));

        today.setUTCHours(0, 0, 0, 0);
        const todayTimestamp: number = today.getTime();

        if(today.getDay() > 0) { // 6 is the day code for sunday

            for(let j = WORK_DAY_START_NORMAL; j < WORK_DAY_END_NORMAL; j = j + TIME_SLOT_INTERVAL) {
                today.setUTCHours(j, 0, 0, 0);
                if(today.getTime() > Date.now()) {
                    timeSlots.push(today.getTime());
                }
            }
        } else {
            for(let j = WORK_DAY_START_SUNDAY; j < WORK_DAY_END_SUNDAY; j = j + TIME_SLOT_INTERVAL) {
                today.setUTCHours(j, 0, 0, 0);
                if(today.getTime() > Date.now()) {
                    timeSlots.push(today.getTime());
                }
            }
        }

        result[todayTimestamp] = timeSlots;
    }

    const allTimeSlots = Object.values(result).reduce((acc, curr) => { return [...acc, ...curr] }, []);

    const validity = await timeSlotsAreValid(allTimeSlots, serviceName).catch(e => {
        throw e;
    });

    if(!validity.status) {
        Object.entries(result).forEach(([key, value]) => {
            result[key] = value.filter(timeSlot => {
                return !validity.data.has(timeSlot);
            })
        })
    }

    return result;
}

// vulnerable
export const update = async (data: any) => {

  const { id, ...update } = data;

  await getRepository(Booking).update(id, update).catch(e => {
      logger.error(`Updating booking id ${id}`, e.stack);
      throw new Error('Booking failed to update')
  })

  const booking = await getRepository(Booking).findOne(id).catch(e => {
      logger.error(`Updating booking id ${id}`)
  });

  if (booking) {
      const mail: MailOptions = {
          to: booking.email,
          subject: 'Booking Update',
          viewName: 'bookingUpdated',
          input: {
              recipientName: booking.name,
              reference: booking.reference
          }
      }
      sendMail(mail).then((response) => {
          logger.info(`[Mail] response`, JSON.stringify(response));
      }).catch(e => {
          console.log(e)
          logger.error(`[Mail] sending to ${booking.email} failed`, e.stack);
      });
  }
  

  return true;
}
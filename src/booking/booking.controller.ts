import { Router } from 'express';
import { createBooking, checkBooking, getTimeSlotsByService, update } from './booking.service';
import { logger } from '../utils/logger';
import { DEFAULT_PERIOD } from '../utils/constants/time.constants';
import passport from 'passport';

const router = Router();

router.post('/', async (req, res) => {

  const { body } = req;

  const response: any = {
    success: false,
    message: 'Booking Creation Failed',
    data: {
        payment: false,
        paymentLink: null,
        reference: null
    },
    errors: []
  }

  const result = await createBooking(body).catch(e => {
      logger.error(e.message, e.stack)
  });

  if(result) {

      response.errors = result.errors;

      if((result.created && result.paymentInitialized) || (result.created && !result.paymentRequested)) {
          response.success = true;
          response.message = 'Booking Creation Successful';
      }
      
      if(result.created && result.paymentInitialized) {
          response.data.payment = result.paymentInitialized
          response.data.paymentLink = result.paymentUrl
          response.data.reference = result.reference
      }
  }

  res.json(response);

})


router.post('/check', async (req, res) => {

  const { body } = req;

  const response: any = {
    success: true,
    message: 'Booking Check Successful',
    data: {},
    errors: []
  }

  const result = await checkBooking(body.reference).catch((e: Error) => {
      logger.error(e.message, e.stack);
      response.errors.push(e.message);
  });

  if(!result || result.errors.length > 0)
  {
      response.success = false;
      response.message = 'Booking Check Failed';
      result ? response.errors.push(... result.errors) : response.errors;
      res.json(response);
      return;
  }

  response.data = Object.entries(result).reduce((acc: any, [key, val]) => {
      if(key  !== 'errors')
      {
          acc[key] = val;
      }

      return acc;
  }, {});

  res.json(response);
})

router.post('/getTimeSlots', async (req, res) => {

  const { body } = req;

  const response: any = {
    success: false,
    message: 'Failed to fetch time slots',
    data: {},
    errors: []
  }

  const result = await getTimeSlotsByService(DEFAULT_PERIOD, body.serviceName).catch(e => {
      logger.error(e.message, e.stack);
  });

  if(result) {
    response.success = true;
    response.message = 'Time slots fetched successfully'
    response.data = result;
  }

  res.json(response);
})


router.post('/edit', passport.authenticate('jwt', {session: false}), async (req, res) => {

  const { body } = req;

  await update(body).catch(e => {
    res.status(400).send(e.message);
    return;
  });

  res.json({
      success: true,
      message: 'Booking Updated'
  });
})

export const BookingRouter = router;
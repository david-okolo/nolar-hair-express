import { Router } from 'express';
import { BookingRouter } from './booking/booking.controller';

const router = Router();

router.use('/booking', BookingRouter);

router.use('/*', (req, res) => {
  res.sendStatus(404);
})

export default router;
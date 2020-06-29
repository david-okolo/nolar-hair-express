import { Router } from 'express';
import { BookingRouter } from './booking/booking.controller';
import { AuthController } from './auth/auth.controller';
import { StoreController } from './store/store.controller';

const router = Router();

router.use('/booking', BookingRouter);
router.use('/auth', AuthController);
router.use('/store', StoreController)

router.use('/*', (req, res) => {
  res.sendStatus(404);
})

export default router;
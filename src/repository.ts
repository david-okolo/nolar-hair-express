import { getRepository, createConnection, Connection } from 'typeorm'
import { Booking } from './entities/booking.entity'
import { Payment } from './entities/payment.entity';
import { logger } from './utils/logger';

createConnection().then((connection: Connection) => {
  logger.info('MYSQL connected')
});

export const bookingRepository = getRepository(Booking);
export const paymentRepository = getRepository(Payment)
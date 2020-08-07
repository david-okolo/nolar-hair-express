"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.bookingRepository = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const payment_entity_1 = require("./entities/payment.entity");
const logger_1 = require("./utils/logger");
typeorm_1.createConnection().then((connection) => {
    logger_1.logger.info('MYSQL connected');
});
exports.bookingRepository = typeorm_1.getRepository(booking_entity_1.Booking);
exports.paymentRepository = typeorm_1.getRepository(payment_entity_1.Payment);
//# sourceMappingURL=repository.js.map
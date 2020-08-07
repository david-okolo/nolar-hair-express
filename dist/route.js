"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("./booking/booking.controller");
const auth_controller_1 = require("./auth/auth.controller");
const store_controller_1 = require("./store/store.controller");
const payment_controller_1 = require("./payment/payment.controller");
const router = express_1.Router();
router.use("/booking", booking_controller_1.BookingRouter);
router.use("/auth", auth_controller_1.AuthController);
router.use("/store", store_controller_1.StoreController);
router.use("/payment", payment_controller_1.PaymentController);
router.use("/*", (req, res) => {
    res.sendStatus(404);
});
exports.default = router;
//# sourceMappingURL=route.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const payment_service_1 = require("./payment.service");
const router = express_1.Router();
const whitelistedIPs = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];
router.post("/webhook", async (req, res) => {
    const hash = crypto_1.default
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (hash === req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const { event, data } = req.body;
        if (event === "charge.success") {
            try {
                await payment_service_1.verifyHook(data.reference);
            }
            catch (error) {
                res.sendStatus(500);
                return;
            }
        }
        res.sendStatus(200);
        return;
    }
    res.sendStatus(400);
});
exports.PaymentController = router;
//# sourceMappingURL=payment.controller.js.map
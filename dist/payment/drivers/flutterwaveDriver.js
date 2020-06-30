"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_driver_interface_1 = require("../interface/payment-driver.interface");
class FlutterwaveDriver extends payment_driver_interface_1.PaymentDriver {
    constructor() {
        super(...arguments);
        this.name = 'Flutterwave';
    }
    async initialize(data) {
        const result = {
            url: 'http://paystack.com',
            accessCode: 'code',
            reference: 'refno'
        };
        return result;
    }
    async verify(reference) {
        const result = {
            currency: 'NGN',
            amount: 500,
            status: 'failed',
            date: '01/11/2020'
        };
        return result;
    }
    async refund(reference, amount, reason) {
        return {
            status: false
        };
    }
}
exports.FlutterwaveDriver = FlutterwaveDriver;
//# sourceMappingURL=flutterwaveDriver.js.map
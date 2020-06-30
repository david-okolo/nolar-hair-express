"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refund = exports.verify = exports.initialize = void 0;
const paystack_1 = __importDefault(require("paystack"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../utils/logger");
const paystack = paystack_1.default(process.env.PAYSTACK_SECRET_KEY);
exports.initialize = async (data) => {
    const result = {
        url: '',
        accessCode: '',
        reference: ''
    };
    const init = await paystack.transaction.initialize(Object.assign(Object.assign({ email: data.email, amount: data.amount }, process.env.NODE_ENV === 'production' && { callback_url: `${process.env.APP_URL}/store/cart/checkout/confirm/${data.reference}` }), data.reference && { reference: data.reference })).catch((e) => {
        logger_1.logger.error(e.message, e.stack);
    });
    if (init && init.status) {
        result.url = init.data.authorization_url;
        result.accessCode = init.data.access_code;
        result.reference = init.data.reference;
    }
    else if (init) {
        throw new Error(init.message);
    }
    else {
        throw new Error('Payment initialization failed');
    }
    return result;
};
exports.verify = async (reference) => {
    const result = {
        currency: 'NGN',
        amount: 500,
        status: 'failed',
        date: '01/11/2020'
    };
    const res = await paystack.transaction.verify(reference).catch((e) => {
        // if the call fails log it. the variable 'res' would be set to null
        logger_1.logger.error(e.message, e.stack);
    });
    if (res && res.status) {
        result.amount = res.data.amount;
        result.currency = res.data.currency;
        result.status = res.data.status;
        result.date = res.data.transaction_date;
    }
    else {
        // either the api call fails or it responds with a bad request object
        throw new Error('Payment verification failed');
    }
    return result;
};
exports.refund = async (reference, amount, reason) => {
    const headers = {
        'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
        'Content-Type': 'application/json'
    };
    const body = {
        transaction: reference,
        amount: amount,
        /* eslint-disable */
        merchant_note: reason,
        /* eslint-disable */
        currency: 'NGN'
    };
    const response = await axios_1.default.post('https://api.paystack.co/refund', body, {
        headers: headers
    });
    if (response.statusText === 'OK') {
        const { data } = response;
        if (data.status) {
            return {
                status: data.data.status
            };
        }
        else {
            throw new Error('Refund Error: Process was unsuccessful for ' + reference);
        }
    }
    else {
        throw new Error('Refund Error: Error contacting paystack');
    }
};
//# sourceMappingURL=paystackDriver.js.map
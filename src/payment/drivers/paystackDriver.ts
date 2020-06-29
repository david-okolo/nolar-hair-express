import Paystack from 'paystack';
import axios from 'axios';

import { IPaymentInitializeArg, IPaymentInitializeResult, IPaymentVerifyResult } from '../interface/payment.interface';
import { logger } from '../../utils/logger';


const paystack: any = Paystack(process.env.PAYSTACK_SECRET_KEY);


export const initialize = async (data: IPaymentInitializeArg) => {

    const result: IPaymentInitializeResult = {
        url: '',
        accessCode: '',
        reference: ''
    }

    const init = await paystack.transaction.initialize({
        email: data.email,
        amount: data.amount,
        ...process.env.NODE_ENV === 'production' && {callback_url: `${process.env.APP_URL}/store/cart/checkout/confirm/${data.reference}`},
        ...data.reference && {reference: data.reference}
    }).catch((e: Error) => {
        logger.error(e.message, e.stack);
    });

    if(init && init.status) {
        result.url = init.data.authorization_url;
        result.accessCode = init.data.access_code;
        result.reference = init.data.reference;
    } else if(init) {
        throw new Error(init.message)
    } else {
        throw new Error('Payment initialization failed')
    }

    return result;
}

export const verify = async (reference: string) => {

    const result: IPaymentVerifyResult = {
        currency: 'NGN',
        amount: 500,
        status: 'failed',
        date: '01/11/2020'
    }

    const res = await paystack.transaction.verify(reference).catch((e: Error) => {
        // if the call fails log it. the variable 'res' would be set to null
        logger.error(e.message, e.stack);
    });

    if(res && res.status) {
        result.amount = res.data.amount;
        result.currency = res.data.currency;
        result.status = res.data.status;
        result.date = res.data.transaction_date;
    } else {
        // either the api call fails or it responds with a bad request object
        throw new Error('Payment verification failed');
    }

    return result;
}

export const refund = async (reference: string, amount: number, reason: string) => {
    const headers = {
        'Authorization': 'Bearer '+process.env.PAYSTACK_SECRET_KEY,
        'Content-Type': 'application/json'
    }
    const body = {
        transaction: reference,
        amount: amount, 
        /* eslint-disable */
        merchant_note: reason,
        /* eslint-disable */
        currency: 'NGN'
    };

    const response = await axios.post('https://api.paystack.co/refund', body, {
        headers: headers
    });

    if(response.statusText === 'OK') {
        const { data } = response;
        if(data.status) {
            return {
                status: data.data.status
            }
        } else {
            throw new Error('Refund Error: Process was unsuccessful for '+reference)
        }
    } else {
        throw new Error('Refund Error: Error contacting paystack')
    }
}
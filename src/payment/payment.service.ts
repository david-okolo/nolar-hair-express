import { IPaymentInitializeResult, IPaymentInitializeArg } from './interface/payment.interface';
import { initialize, verify, refund } from './drivers/paystackDriver';
import { Payment } from '../entities/payment.entity';
import { logger } from '../utils/logger';
import { getRepository } from 'typeorm';

export const initializePayment = async (data: IPaymentInitializeArg): Promise<IPaymentInitializeResult> | null => {
    const initResult = await initialize(data).catch(e => {
        throw e;
    });

    let payment: Payment;
    if(initResult)
    {
        payment = await getRepository(Payment).save({
            authorizationUrl: initResult.url,
            booking: data?.booking,
            reference: initResult.reference,
            amount: data.amount
        }).catch(e => {
            throw e;
        });
        initResult.paymentEntity = payment;
    }

    return initResult || null;
}

export const verifyPayment = async (reference: string): Promise<{
    success: boolean
    status: string
}> => {

    const verification = await verify(reference).catch(e => {
        throw e;
    });

    if(verification && verification.status === 'success') {
        await getRepository(Payment).update(
            { 
                reference: reference
            },
            {
                verified: true,
                success: true
            }
        ).catch(e => {
            throw e;
        });

        return {
            success: true,
            status: verification.status
        };
    } else if (verification && verification.status === 'reversed') {
        return {
            success: true,
            status: verification.status
        }
    }

    return {
        success: false,
        status: 'failed'
    };
}

export const refundPayment = async (reference: string, amount: number, reason: string) => {

    
    const payment = await getRepository(Payment).findOne({
        where: {
            reference
        }
    }).catch(e => {
        logger.error(e)
        throw e;
    })

    if(payment && payment.refundInit === false) {
        const response = await refund(reference, amount, reason).catch(e => {
            throw e;
        });

        if(response.status) {
            payment.refundInit = true
            getRepository(Payment).save(payment)
        }

        return {
            ...response,
            message: 'Refund Initialized'
        }
    } else if(payment) {
        return {
            status: 'failed',
            message: 'Refund has already been initialized'
        }
    }

    // if(verification && verification.status) {
    //     await this.getRepository(Payment).update(
    //         { 
    //             reference: reference
    //         },
    //         {
    //             verified: true,
    //             success: true
    //         }
    //     ).catch(e => {
    //         throw e;
    //     });

    //     return true;
    // }

    return {
        status: 'failed',
        message: 'Refund failed'
    };
}


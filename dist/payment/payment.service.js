"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.verifyPayment = exports.verifyHook = exports.initializePayment = void 0;
const paystackDriver_1 = require("./drivers/paystackDriver");
const payment_entity_1 = require("../entities/payment.entity");
const typeorm_1 = require("typeorm");
exports.initializePayment = async (data) => {
    const initResult = await paystackDriver_1.initialize(data).catch((e) => {
        throw e;
    });
    let payment;
    if (initResult) {
        payment = await typeorm_1.getRepository(payment_entity_1.Payment)
            .save({
            authorizationUrl: initResult.url,
            booking: data === null || data === void 0 ? void 0 : data.booking,
            reference: initResult.reference,
            amount: data.amount,
        })
            .catch((e) => {
            throw e;
        });
        initResult.paymentEntity = payment;
    }
    return initResult || null;
};
exports.verifyHook = async (reference) => {
    const payment = await typeorm_1.getRepository(payment_entity_1.Payment)
        .update({
        reference: reference,
    }, {
        verified: true,
        success: true,
    })
        .catch((e) => {
        throw e;
    });
    return true;
};
exports.verifyPayment = async (reference) => {
    const verification = await paystackDriver_1.verify(reference).catch((e) => {
        throw e;
    });
    if (verification && verification.status === "success") {
        await typeorm_1.getRepository(payment_entity_1.Payment)
            .update({
            reference: reference,
        }, {
            verified: true,
            success: true,
        })
            .catch((e) => {
            throw e;
        });
        return {
            success: true,
            status: verification.status,
        };
    }
    else if (verification && verification.status === "reversed") {
        return {
            success: true,
            status: verification.status,
        };
    }
    return {
        success: false,
        status: "failed",
    };
};
exports.refundPayment = async (reference, amount, reason) => {
    const payment = await typeorm_1.getRepository(payment_entity_1.Payment).findOne({
        where: {
            reference,
        },
    });
    if (payment && payment.refundInit === false) {
        const response = await paystackDriver_1.refund(reference, amount, reason).catch((e) => {
            throw e;
        });
        if (response.status) {
            payment.refundInit = true;
            typeorm_1.getRepository(payment_entity_1.Payment).save(payment);
        }
        return Object.assign(Object.assign({}, response), { message: "Refund Initialized" });
    }
    else if (payment) {
        return {
            status: "failed",
            message: "Refund has already been initialized",
        };
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
        status: "failed",
        message: "Refund failed",
    };
};
//# sourceMappingURL=payment.service.js.map
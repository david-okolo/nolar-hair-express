"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoreCategory = exports.createProduct = exports.verify = exports.buyProducts = exports.findAll = void 0;
const payment_service_1 = require("../payment/payment.service");
const product_entity_1 = require("../entities/product.entity");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const storeCategory_entity_1 = require("../entities/storeCategory.entity");
const cartItem_entity_1 = require("../entities/cartItem.entity");
const storeTransaction_entity_1 = require("../entities/storeTransaction.entity");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const conversion_constants_1 = require("../utils/constants/conversion.constants");
const error_constants_1 = require("../utils/constants/error.constants");
const mailer_service_1 = require("../mailer/mailer.service");
exports.findAll = async () => {
    return await typeorm_1.getRepository(storeCategory_entity_1.StoreCategory)
        .find({ relations: ["products"] })
        .catch((e) => {
        logger_1.logger.error(e.message, e);
        throw new Error(error_constants_1.DatabaseErrorMessage);
    });
};
exports.buyProducts = async (data) => {
    // generate price
    const products = await typeorm_1.getRepository(product_entity_1.Product)
        .findByIds(data.selectedProducts.map((item) => {
        return item.id;
    }))
        .catch((e) => {
        logger_1.logger.error(e.message, e);
        throw new Error(error_constants_1.DatabaseErrorMessage);
    });
    /**
     * inefficient
     */
    const totalPrice = products.reduce((acc, curr) => {
        // discounts are set in decimals like 0.2 for 20% discount
        const totalItemPrice = curr.price *
            ((100 - curr.discount) / 100) *
            data.selectedProducts.find((item) => item.id === curr.id).count;
        return acc + totalItemPrice;
    }, 0);
    // store cart
    const cartItems = [];
    for (let item of data.selectedProducts) {
        const cartItem = new cartItem_entity_1.CartItem();
        cartItem.count = item.count;
        cartItem.product = products.find((product) => product.id === item.id);
        cartItems.push(cartItem);
    }
    await typeorm_1.getRepository(cartItem_entity_1.CartItem)
        .insert(cartItems)
        .catch((e) => {
        logger_1.logger.error(e.message, e);
        throw new Error(error_constants_1.DatabaseErrorMessage);
    });
    // initialize transaction
    const payment = await payment_service_1.initializePayment({
        email: data.email,
        amount: totalPrice * conversion_constants_1.NAIRA_TO_KOBO,
        reference: uuid_1.v4(),
    }).catch((e) => {
        throw e;
    });
    const storeTransaction = new storeTransaction_entity_1.StoreTransaction();
    storeTransaction.amount = totalPrice;
    storeTransaction.cartItems = cartItems;
    storeTransaction.email = data.email;
    storeTransaction.name = data.name;
    if (payment) {
        storeTransaction.reference = payment.reference;
        storeTransaction.payment = payment.paymentEntity;
    }
    const result = await typeorm_1.getRepository(storeTransaction_entity_1.StoreTransaction).save(storeTransaction);
    return {
        paymentUrl: payment ? payment.url : null,
        reference: result.reference,
    };
};
exports.verify = async (reference) => {
    const result = {
        verified: false,
        status: "failed",
        errors: [],
    };
    const verified = await payment_service_1.verifyPayment(reference);
    result.verified = verified.success;
    result.status = verified.status;
    const transaction = await typeorm_1.getRepository(storeTransaction_entity_1.StoreTransaction).findOne({
        where: {
            reference: reference,
        },
        relations: ["cartItems"],
    });
    let totalRefund = 0;
    let productsPurchasedAsString = "";
    if (verified.status === "success") {
        for (let i = 0; i < transaction.cartItems.length; i++) {
            const element = transaction.cartItems[i];
            const product = await typeorm_1.getRepository(product_entity_1.Product).findOne(element.productId);
            let productPurchasedString = `${element.count} unit(s) of ${product.name} at a total of ${(element.count * product.price).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}`;
            if (product.count < element.count) {
                totalRefund +=
                    product.price * ((100 - product.discount) / 100) * element.count;
                result.errors.push({
                    code: "LTAVAIL",
                    message: `Sorry we have less than your requested amount of ${product.name} available, A refund has been initiated`,
                });
            }
            else {
                product.count = product.count - element.count;
                await typeorm_1.getRepository(product_entity_1.Product).save(product);
            }
            productsPurchasedAsString =
                i === 0
                    ? productPurchasedString
                    : i === transaction.cartItems.length - 1
                        ? productsPurchasedAsString + " and " + productPurchasedString
                        : productsPurchasedAsString + ", " + productPurchasedString;
        }
        const message = {
            to: "store@nolarhair.com.ng",
            subject: "New Purchase",
            viewName: "productPurchased",
            input: {
                customerEmail: transaction.email,
                txRef: transaction.reference,
                purchaseList: productsPurchasedAsString,
            },
        };
        mailer_service_1.sendMail(message)
            .then((response) => {
            logger_1.logger.info(`[Mail] response`, JSON.stringify(response));
        })
            .catch((e) => {
            logger_1.logger.error(`[Mail] sending for transaction ${transaction.reference} failed`, e.stack);
        });
    }
    else {
        return result;
    }
    // let refund;
    // if(totalRefund !== 0) {
    //     refund = await refundPayment(reference, totalRefund * 100, `Item(s) were already purchased by someone else while transaction with reference ${reference} was being processed`).catch(e => {
    //         logger.error(e)
    //     })
    // }
    transaction.amountPaid = transaction.amount;
    transaction.amountRefunded = 0;
    typeorm_1.getRepository(storeTransaction_entity_1.StoreTransaction).save(transaction);
    return result;
};
exports.createProduct = async (product) => {
    const existingProduct = await typeorm_1.getRepository(product_entity_1.Product)
        .findOne({
        where: {
            name: product.name,
        },
    })
        .catch((e) => {
        logger_1.logger.error(`Product creation ${product.name}`, e.stack);
    });
    if (existingProduct) {
        throw new Error("Identically named product already exists.");
    }
    const category = await typeorm_1.getRepository(storeCategory_entity_1.StoreCategory).findOne(product.storeCategoryId);
    const newProduct = new product_entity_1.Product();
    newProduct.name = product.name;
    newProduct.imageUrl = product.imageUrl;
    newProduct.price = product.price;
    newProduct.count = product.count;
    newProduct.storeCategory = category;
    await typeorm_1.getRepository(product_entity_1.Product)
        .save(newProduct)
        .catch((e) => {
        logger_1.logger.error(`Product creation ${product.name}`, e.stack);
        throw e;
    });
    return true;
};
exports.createStoreCategory = async (data) => {
    const result = new response_1.InternalResponse(false);
    const category = new storeCategory_entity_1.StoreCategory();
    category.categoryName = data.categoryName;
    typeorm_1.getRepository(storeCategory_entity_1.StoreCategory)
        .save(category)
        .catch((e) => {
        logger_1.logger.error(e.message);
        return result;
    });
    result.status = true;
    return result;
};
//# sourceMappingURL=store.service.js.map
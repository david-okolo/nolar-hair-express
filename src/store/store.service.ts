import { initializePayment, verifyPayment, refundPayment } from '../payment/payment.service';
import { Product } from '../entities/product.entity';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StoreCategory } from '../entities/storeCategory.entity';
import { CartItem } from '../entities/cartItem.entity';
import { StoreTransaction } from '../entities/storeTransaction.entity';
import { BuyProductsDto } from './dto/buyproducts.dto';
import { logger } from '../utils/logger';
import { CreateProductDto } from './dto/createProduct.dto';
import { InternalResponse } from '../utils/response';
import { NAIRA_TO_KOBO } from '../utils/constants/conversion.constants';
import { DatabaseErrorMessage } from '../utils/constants/error.constants';



    export const findAll = async () => {
        return await getRepository(StoreCategory).find({relations: ['products']}).catch(e => {
            logger.error(e.message, e)
            throw new Error(DatabaseErrorMessage);
        })
    }

    export const buyProducts = async (data: BuyProductsDto) => {
        // generate price
        const products = await getRepository(Product).findByIds(data.selectedProducts.map(item => {
            return item.id
        })).catch(e => {
            logger.error(e.message, e)
            throw new Error(DatabaseErrorMessage);
        })

        /**
         * inefficient
         */
        const totalPrice = products.reduce((acc, curr) => {
            // discounts are set in decimals like 0.2 for 20% discount
            const totalItemPrice = (curr.price * ((100 - curr.discount)/100) * data.selectedProducts.find(item => item.id === curr.id).count);
            return acc + totalItemPrice;
        }, 0);

        // store cart
        const cartItems: CartItem[] = [];

        for (let item of data.selectedProducts) {
            const cartItem = new CartItem();
            cartItem.count = item.count
            cartItem.product = products.find(product => product.id === item.id)   
            cartItems.push(cartItem);
        }

        await getRepository(CartItem).insert(cartItems).catch(e => {
            logger.error(e.message, e)
            throw new Error(DatabaseErrorMessage);
        })

        // initialize transaction
        const payment = await initializePayment({
            email: data.email,
            amount: totalPrice * NAIRA_TO_KOBO,
            reference: uuidv4()
        }).catch(e => {
            throw e;
        })


        const storeTransaction = new StoreTransaction();
        storeTransaction.amount = totalPrice;
        storeTransaction.cartItems = cartItems;
        storeTransaction.email = data.email;
        storeTransaction.name = data.name;

        if(payment) {
            storeTransaction.reference = payment.reference;
            storeTransaction.payment = payment.paymentEntity;
        }

        const result = await getRepository(StoreTransaction).save(storeTransaction);

        return {
            paymentUrl: payment ? payment.url : null,
            reference: result.reference
        }

    }

    export const verify = async (reference: string) => 
    {
        const result: any = {
            verified: false,
            status: 'failed',
            errors: []
        }

        const verified = await verifyPayment(reference);

        result.verified = verified.success;
        result.status = verified.status;

        const transaction = await getRepository(StoreTransaction).findOne({
            where: {
                reference: reference
            },
            relations: ['cartItems']
        });

        let totalRefund = 0;

        if(verified.status === 'success') {

             for(let i = 0; i < transaction.cartItems.length; i++) {
                const element = transaction.cartItems[i];
                const product = await getRepository(Product).findOne(element.productId)
                if(product.count < element.count) {
                    totalRefund += (product.price * ((100 - product.discount)/100)) * element.count;
                    result.errors.push({code: 'LTAVAIL', message: `Sorry we have less than your requested amount of ${product.name} available, A refund has been initiated`});
                } else {
                    product.count = product.count - element.count;
                    await getRepository(Product).save(product);
                }
            };
        } else {
            return result
        }

        let refund;

        if(totalRefund !== 0) {
            refund = await refundPayment(reference, totalRefund * 100, `Item(s) were already purchased by someone else while transaction with reference ${reference} was being processed`).catch(e => {
                logger.error(e)
            })
        }

        transaction.amountPaid = transaction.amount - totalRefund;
        transaction.amountRefunded = totalRefund;

        if (refund) {
            transaction.refundStatus = refund.status
            result.status = refund.status;
        }

        getRepository(StoreTransaction).save(transaction);

        return result;
    }

    export const createProduct = async (product: CreateProductDto) => {
        const existingProduct = await getRepository(Product).findOne({
            where: {
                name: product.name
            }
        }).catch(e => {
            logger.error(`Product creation ${product.name}`, e.stack)
        });

        if (existingProduct) {
            throw new Error('Identically named product already exists.')
        }

        const category = await getRepository(StoreCategory).findOne(product.storeCategoryId);

        const newProduct = new Product();
        newProduct.name = product.name
        newProduct.imageUrl = product.imageUrl
        newProduct.price = product.price
        newProduct.count = product.count
        newProduct.storeCategory = category

        await getRepository(Product).save(newProduct).catch(e => {
            logger.error(`Product creation ${product.name}`, e.stack);
            throw e;
        })

        return true;
    }

    export const createStoreCategory = async (data: any) => {

        const result = new InternalResponse(false);

        const category = new StoreCategory();
        category.categoryName = data.categoryName;
        getRepository(StoreCategory).save(category).catch(e => {
            logger.error(e.message)
            return result;
        })

        result.status = true;
        return result;
    }

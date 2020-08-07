"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const express_1 = require("express");
const storeService = __importStar(require("./store.service"));
const multer_1 = require("../utils/multer");
const router = express_1.Router();
router.get('/list', async (req, res) => {
    const productList = await storeService.findAll();
    res.json({
        success: true,
        message: 'Product list successfully fetched',
        data: productList
    });
});
router.post('/verify', async (req, res) => {
    const { body } = req;
    const result = await storeService.verify(body.reference).catch(e => {
        console.log(e);
        res.status(500).json({
            message: 'Error occured verifying payment'
        });
    });
    if (!result)
        return;
    res.json(Object.assign({ success: result.verified, status: result.status, message: result.verified ? 'Payment Successful' : 'Payment Not Successful' }, result.errors.length > 0 && { errors: result.errors }));
});
router.post('/pay', async (req, res) => {
    const { body } = req;
    const result = await storeService.buyProducts(body).catch(e => {
        console.log(e);
        res.sendStatus(500);
    });
    if (result) {
        res.json({
            success: true,
            data: result,
            message: 'Payment Initialized'
        });
        return;
    }
});
router.post('/addProduct', multer_1.upload.single('productImage'), async (req, res) => {
    const { body, file } = req;
    const { imageUrl } = body, rest = __rest(body, ["imageUrl"]);
    const created = await storeService.createProduct(Object.assign(Object.assign({}, rest), { imageUrl: file.path.substr(6) //removes the public
     })).catch(e => {
        res.status(500).json({
            message: 'Error creating product. Try again later'
        });
    });
    if (!created) {
        res.status(500).json({
            message: 'Error creating product. Try again later'
        });
        return;
    }
    res.json({
        success: true,
        message: 'Successfully created'
    });
});
router.post('/addCategory', async (req, res) => {
    const { body } = req;
    const result = await storeService.createStoreCategory(body).catch(e => {
        res.status(500).json({
            message: 'Error creating category'
        });
    });
    if (!result) {
        return;
    }
    res.json({
        success: true,
        message: 'Successfully created'
    });
});
router.use('/*', (req, res) => {
    res.sendStatus(404);
});
exports.StoreController = router;
//# sourceMappingURL=store.controller.js.map
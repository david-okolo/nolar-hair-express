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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const authService = __importStar(require("./auth.service"));
const router = express_1.Router();
router.post('/login', async (req, res) => {
    const { body } = req;
    const result = await authService.login(body).catch(e => {
        res.sendStatus(500);
        return;
    });
    if (!result || !result.status) {
        res.sendStatus(404);
        return;
    }
    res.json({
        success: result.status,
        data: result.data,
        message: 'Login Successful'
    });
});
router.post('/register', async (req, res) => {
    const { body } = req;
    const result = await authService.register(body).catch(e => {
        res.sendStatus(500);
        return;
    });
    if (!result || !result.status) {
        res.sendStatus(404);
        return;
    }
    res.json({
        success: result.status,
        message: 'Registered Successfully'
    });
});
exports.AuthController = router;
//# sourceMappingURL=auth.controller.js.map
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
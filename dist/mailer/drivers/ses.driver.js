"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
exports.getOptions = () => {
    return { SES: new aws_sdk_1.default.SES() };
};
//# sourceMappingURL=ses.driver.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, printf } = winston_1.format;
exports.logger = winston_1.createLogger({
    format: combine(timestamp(), printf(({ level, message, timestamp }) => {
        return `${timestamp} - ${level.toUpperCase()} - ${message}`;
    })),
    transports: [
        new winston_daily_rotate_file_1.default({
            dirname: './logs',
            filename: '%DATE%.error.log'
        })
    ]
});
//# sourceMappingURL=logger.js.map
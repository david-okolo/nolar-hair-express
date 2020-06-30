"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_entity_1 = require("../entities/user.entity");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
exports.login = async ({ username, password }) => {
    // get user by username
    const user = await typeorm_1.getRepository(user_entity_1.User).findOne({
        where: {
            username
        }
    }).catch(e => {
        logger_1.logger.error(e.message);
        throw e;
    });
    // if exists, compare passwords
    if (!user) {
        return new response_1.InternalResponse(false, {}, ['Invalid login details']);
    }
    if (!(await bcrypt_1.default.compare(password, user.password))) {
        return new response_1.InternalResponse(false, {}, ['Invalid login details']);
    }
    // if valid, sign token and return
    const token = jsonwebtoken_1.default.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET);
    return new response_1.InternalResponse(true, { token });
};
exports.register = async ({ name, username, password }) => {
    //validate
    //store
    const user = new user_entity_1.User();
    // user.name = name;
    user.username = username;
    user.password = await bcrypt_1.default.hash(password, 10);
    await typeorm_1.getRepository(user_entity_1.User).save(user).catch(e => {
        logger_1.logger.error(e.message);
        return new response_1.InternalResponse(false);
    });
    return new response_1.InternalResponse(true);
};
//# sourceMappingURL=auth.service.js.map
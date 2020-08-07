"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const logger_1 = require("../../utils/logger");
const options = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const verify = async (payload, done) => {
    const user = typeorm_1.getRepository(user_entity_1.User).findOne(payload.sub).catch(e => {
        logger_1.logger.error(e.message);
        done(e, false);
        return;
    });
    if (!user) {
        done(null, false);
        return;
    }
    done(null, user);
};
exports.jwtStrategy = new passport_jwt_1.Strategy(options, verify);
//# sourceMappingURL=jwt.strategy.js.map
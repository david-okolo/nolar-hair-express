import { Strategy, ExtractJwt, StrategyOptions, VerifyCallback } from 'passport-jwt';
import { getRepository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { logger } from '../../utils/logger';

const options: StrategyOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
}

const verify: VerifyCallback = async (payload, done) => {
  const user = getRepository(User).findOne(payload.sub).catch(e => {
    logger.error(e.message);
    done(e, false)
    return;
  })

  if (!user) {
    done(null, false)
    return;
  }

  done(null, user)
}

export const jwtStrategy = new Strategy(options, verify)
import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../entities/user.entity'
import { logger } from '../utils/logger'
import { InternalResponse } from '../utils/response'

export const login = async ({username, password}: { username: string, password: string}) => {
  // get user by username
  const user = await getRepository(User).findOne({
    where: {
      username
    }
  }).catch(e => {
    logger.error(e.message)
    throw e;
  })

  // if exists, compare passwords
  if (!user) {
    return new InternalResponse(false, {}, ['Invalid login details'])
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return new InternalResponse(false, {}, ['Invalid login details'])
  }

  // if valid, sign token and return
  const token = jwt.sign({sub: user.id, username: user.username}, process.env.JWT_SECRET);
  return new InternalResponse(true, {token})
}

export const register = async ({name, username, password}: any) => {
  //validate

  //store
  const user = new User();
  // user.name = name;
  user.username = username;
  user.password = await bcrypt.hash(password, 10);
  await getRepository(User).save(user).catch(e => {
    logger.error(e.message);
    return new InternalResponse(false);
  })

  return new InternalResponse(true)
}
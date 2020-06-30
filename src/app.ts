import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';

import express from 'express';
import { resolve } from 'path';
import cors from 'cors';
import { Connection, createConnection } from 'typeorm';
import AWS from 'aws-sdk';
import passport from 'passport';

import routes from './route';
import { logger } from './utils/logger';
import { buildViews } from './view/view.service';
import { jwtStrategy } from './auth/strategy/jwt.strategy';
import { Booking } from './entities/booking.entity';
import { CartItem } from './entities/cartItem.entity';
import { Payment } from './entities/payment.entity';
import { Product } from './entities/product.entity';
import { Service } from './entities/service.entity';
import { StoreCategory } from './entities/storeCategory.entity';
import { StoreTransaction } from './entities/storeTransaction.entity';
import { User } from './entities/user.entity';

// library initializatio
buildViews();
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
})
createConnection({
  type: 'mysql',
  host: 'localhost',
  username: process.env.NODE_ENV === 'production' ? 'nolarhai_dev' : 'root',
  password: process.env.NODE_ENV === 'production' ? 'neVerland94@' : '',
  database: process.env.NODE_ENV === 'production' ? 'nolarhai_development' : 'nolar_dev',
  port: 3306,
  synchronize: true,
  entities: [Booking, CartItem, Payment, Product, Service, StoreCategory, StoreTransaction, User]
}).then((connection: Connection) => {
  logger.info('MYSQL connected')
});


const app = express();


// Middlewares
app.use(cors());

app.use(express.json());

passport.use(jwtStrategy);

app.use(passport.initialize())


// Routes
app.use(express.static('public'));

app.use('/api', routes)

app.get('/*', (req, res) => {
  res.sendFile(resolve('public', 'index.html'))
})

app.listen(process.env.PORT);
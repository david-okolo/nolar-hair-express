import express from 'express';
import { resolve } from 'path';
import cors from 'cors';
import { Connection, createConnection } from 'typeorm';
import AWS from 'aws-sdk';

import routes from './route';
import { logger } from './utils/logger';
import { buildViews } from './view/view.service';

buildViews();
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
})

createConnection().then((connection: Connection) => {
  logger.info('MYSQL connected')
});

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static('public'));

app.use('/api', routes)

app.get('/*', (req, res) => {
  res.sendFile(resolve('public', 'index.html'))
})

export default app;
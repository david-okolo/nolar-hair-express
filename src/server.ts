import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import app from './app';

app.listen(process.env.PORT, () => {
  console.log('Started on port '+process.env.PORT)
});
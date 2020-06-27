import { Logger, createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

export const logger: Logger = createLogger({
  format: combine(
      timestamp(),
      printf(({level, message, timestamp}) => {
          return `${timestamp} - ${level.toUpperCase()} - ${message}`
      })
  ),
  transports: [
      new DailyRotateFile({
          dirname: './logs',
          filename: '%DATE%.error.log'
      })
  ]
});
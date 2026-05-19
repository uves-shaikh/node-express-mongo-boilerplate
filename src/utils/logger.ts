import { createLogger, format, transports } from 'winston';
import { config } from '../config';

const { combine, timestamp, errors, json, colorize, simple } = format;

// In development: human-readable coloured output
// In production: structured JSON for log aggregators (Datadog, CloudWatch, etc.)
const logger = createLogger({
  level: config.isDev ? 'debug' : 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }), // include stack traces on Error objects
    json()
  ),
  transports: [
    new transports.Console({
      format: config.isDev ? combine(colorize(), simple()) : combine(timestamp(), json()),
    }),
  ],
});

export default logger;

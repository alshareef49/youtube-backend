import { createLogger,format,transports } from 'winston';

function createLoggerUtil(label) {
  return createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.label({ label }),
      format.printf((info) => {
        const logObject = {
          timestamp: info.timestamp,
          level: info.level,
          label: info.label,
          message: info.message,
        };
        const { timestamp, level, label: _, message, ...meta } = info;
        if (Object.keys(meta).length) {
          logObject.meta = meta;
        }
        return JSON.stringify(logObject);
      })
    ),
    transports: [
      new transports.Console(),
    ]
  });
}

export { createLoggerUtil }

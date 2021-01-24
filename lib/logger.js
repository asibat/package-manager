const { createLogger, format, transports } = require('winston')

const customFormat = format.combine(
  format.errors({ stack: true }),
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
)

const logger = createLogger({
  level: 'info',
  format: customFormat,
  defaultMeta: { service: 'package-manager-service' },
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
})

module.exports = {
  logger,
}

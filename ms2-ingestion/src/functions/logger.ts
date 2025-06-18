// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Añade un timestamp
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`; // Formato personalizado
    })
  ),
  transports: [
    new winston.transports.Console(), // Muestra los logs en la consola
  ],
});

export default logger;

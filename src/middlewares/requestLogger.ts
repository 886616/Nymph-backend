import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
      }
    );
  });

  next();
};

export default requestLogger;

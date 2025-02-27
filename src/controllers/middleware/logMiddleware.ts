import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import logger from '../../helpers/logger';

export const loggerContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info({
    message: 'Request received',
    requestId: uuidv4(),
    requestedBy: req.headers['requested-by'],
    method: req.method,
    url: req.url,
  });
  next();
};

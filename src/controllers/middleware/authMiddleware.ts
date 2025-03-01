import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../../helpers/config';
import { User } from '../../types';
import logger from '../../helpers/logger';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(400).json({ error: 'Authorization token missing' });
    return;
  }

  jwt.verify(token, config.GOOGLE_CLIENT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      logger.error('Error verifying token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded as User;

    next();
  });
};

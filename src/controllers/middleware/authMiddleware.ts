import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../../helpers/config';
import { User } from '../../types';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Authorization token missing' });
    return;
  }
  console.log('GOT TOKEN', token);

  // 2. Verify the token
  jwt.verify(token, config.GOOGLE_CLIENT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.log('decoded', decoded);

    // 3. Attach the decoded data to the request (optional)
    req.user = decoded as User;

    // 4. Proceed to the next middleware or route handler
    next();
  });
};

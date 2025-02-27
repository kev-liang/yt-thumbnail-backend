import { Request, Response, type Express } from 'express';
import config from '../helpers/config';
import axios from 'axios';
import {
  authenticateUser,
  generateJWT,
  verifyRefreshToken,
} from '../helpers/authHelper';
import { verifyToken } from './middleware/authMiddleware';
import logger from '../helpers/logger';

const AuthController = (app: Express) => {
  const authenticateUserWithCode = async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is missing' });
      return;
    }

    try {
      const url = 'https://oauth2.googleapis.com/token';
      const body = {
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      };
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const userPayload = await authenticateUser(response.data.id_token);
      res.json({ ...userPayload });
    } catch (error) {
      console.error(`Error during token exchange. User: ${req.user}.`, error);
      res.status(500).json({ error: 'Error during OAuth token exchange' });
    }
  };

  interface AuthenticateUserWithTokenBody {
    accessToken: string;
  }
  const authenticateUserWithToken = async (
    req: Request<{}, {}, AuthenticateUserWithTokenBody>,
    res: Response
  ) => {
    if (!req.user) {
      res.status(400).json('Error no user found');
    }

    res.status(200).json(req.user);
  };

  const refreshTokenHandler = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    try {
      const decoded = await verifyRefreshToken(refreshToken);
      const { userId, email, name, picture } = decoded as {
        userId: string;
        email: string;
        name: string;
        picture: string;
      };

      const userPayload = {
        userId,
        email,
        name,
        picture,
      };
      const newAccessToken = generateJWT(userPayload, '1h');
      const newRefreshToken = generateJWT(userPayload, '30d');

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error('Invalid refresh token');
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  };

  app.post('/auth/google/code', authenticateUserWithCode);
  app.post('/auth/google/token', verifyToken, authenticateUserWithToken);
  app.post('/refresh-token', refreshTokenHandler);
};

export default AuthController;

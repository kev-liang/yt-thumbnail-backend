import { Request, Response, type Express } from 'express';
import config from '../helpers/config';
import axios from 'axios';
import {
  authenticateUser,
  generateJWT,
  verifyRefreshToken,
} from '../helpers/authHelper';

const AuthController = (app: Express) => {
  const authenticateUserHandler = async (req: Request, res: Response) => {
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
      console.error('Error during token exchange:', error);
      res.status(500).json({ error: 'Error during OAuth token exchange' });
    }
  };

  const refreshTokenHandler = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    console.log('REFRESHING', refreshToken);

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
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  };

  app.post('/auth/google/code', authenticateUserHandler);
  app.post('/refresh-token', refreshTokenHandler);
};

export default AuthController;

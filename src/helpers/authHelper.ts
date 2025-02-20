import config from './config';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { StringValue } from 'ms';

export const generateJWT = (
  payload: object,
  expiresIn: StringValue | undefined
): string => {
  return jwt.sign(payload, config.GOOGLE_CLIENT_SECRET, {
    expiresIn,
  });
};

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const authenticateUser = async (idToken: string) => {
  try {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid ID token');
    }

    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    const customPayload = {
      userId,
      email,
      name,
      picture,
    };

    const accessToken = jwt.sign(customPayload, config.GOOGLE_CLIENT_SECRET, {
      expiresIn: '1hr',
    });
    const refreshToken = jwt.sign(customPayload, config.GOOGLE_CLIENT_SECRET);
    return { accessToken, refreshToken, user: customPayload };
  } catch (err) {
    console.error('Error authenticating user:', err);
    throw new Error('Authentication failed');
  }
};

// Middleware to verify the refresh token
export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, config.GOOGLE_CLIENT_SECRET, (err, decoded) => {
      if (err) {
        reject('Invalid or expired refresh token');
      } else {
        resolve(decoded);
      }
    });
  });
};

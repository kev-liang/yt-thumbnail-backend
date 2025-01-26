import config from './config';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { StringValue } from 'ms';

export const generateJWT = (
  payload: object,
  expiresIn: StringValue
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

    // Extract user information
    const userId = payload.sub; // Google user ID (unique per user)
    const email = payload.email; // User email
    const name = payload.name; // Full name
    const picture = payload.picture; // Profile picture (optional)

    // Create a custom payload for your JWT
    const customPayload = {
      userId, // Use Google ID as the unique user identifier
      email,
      name,
      picture,
    };

    // Generate your own JWT
    const appJWT = generateJWT(customPayload, '1h');
    const refreshToken = generateJWT(customPayload, '30d');
    return { jwt: appJWT, refreshToken, user: customPayload };
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

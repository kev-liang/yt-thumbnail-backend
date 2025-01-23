import config from './config';
import jwt from 'jsonwebtoken';
import consts from './consts';
import { OAuth2Client } from 'google-auth-library';

export const generateJWT = (payload: object): string => {
  return jwt.sign(payload, config.GOOGLE_CLIENT_SECRET, {
    expiresIn: consts.JWT_EXPIRATION_TIME,
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

    console.log('validatied', payload);

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
    const appJWT = generateJWT(customPayload);
    return { jwt: appJWT, user: customPayload };
  } catch (err) {
    console.error('Error authenticating user:', err);
    throw new Error('Authentication failed');
  }
};

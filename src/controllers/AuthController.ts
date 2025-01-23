import { Request, Response, type Express } from 'express';
import passport from 'passport';
import config from '../helpers/config';
import axios from 'axios';

// passport.use(
//   new GoogleStrategy.Strategy(
//     {
//       clientID: config.GOOGLE_CLIENT_ID,
//       clientSecret: config.GOOGLE_CLIENT_SECRET,
//       // TODO make this prod / dev url
//       callbackURL: config.REDIRECT_URI,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Store user profile and tokens in your session or database
//       console.log('Google profile:', profile);
//       console.log('Access Token:', accessToken);
//       return done(null, profile);
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null);
// });

const AuthController = (app: Express) => {
  app.post('/auth/google/code', async (req: Request, res: Response) => {
    const { code } = req.body;
    console.log('CONFIG', config);

    if (!code) {
      res.status(400).json({ error: 'Authorization code is missing' });
      return;
    }

    try {
      // Manually exchange the code for tokens using Passport
      // passport.authenticate('google', (err: any, user: any) => {
      //   if (err) {
      //     res
      //       .status(500)
      //       .json({ error: 'OAuth exchange failed', details: err });
      //     return;
      //   }
      //   res.json({ user });
      // })(req, res); // Trigger passport authenticate flow
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
      console.log('GOT RES', response.data);
      res.json({ ...response.data });
    } catch (error) {
      console.error('Error during token exchange:', error);
      res.status(500).json({ error: 'Error during OAuth token exchange' });
    }
  });
};

export default AuthController;

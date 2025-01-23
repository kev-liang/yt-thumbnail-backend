import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  GOOGLE_REDIRECT_URI: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const config: Config = {
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '',
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};

export default config;

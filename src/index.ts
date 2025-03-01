import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

import FileController from './controllers/FileController';
import TitleController from './controllers/TitleController';
import ImageDataController from './controllers/ImageDataController';
import AuthController from './controllers/AuthController';
import StripeController from './controllers/StripeController';
import UserController from './controllers/UserController';
import { loggerContext } from './controllers/middleware/logMiddleware';
import logger from './helpers/logger';
import fs from 'fs';
import path from 'path';
import https from 'https';

const app = express();
const options = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
  requestCert: false,
  rejectUnauthorized: false,
};

const server = https.createServer(options, app);
import { initializeWebSocket } from './socket/socket';
initializeWebSocket(server);

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(loggerContext);

StripeController(app);

FileController(app);
TitleController(app);
ImageDataController(app);
AuthController(app);
UserController(app);

const port = 5000;

server.listen(port, () => {
  console.log(`Socket is running on http://localhost:${port}`);
});

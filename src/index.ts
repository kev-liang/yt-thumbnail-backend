import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

dotenv.config();

import FileController from './controllers/FileController';
import TitleController from './controllers/TitleController';
import ImageDataController from './controllers/ImageDataController';
import AwsService from './services/AwsService';
import AuthController from './controllers/AuthController';
import StripeController from './controllers/StripeController';
import UserController from './controllers/UserController';

const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());

StripeController(app);

FileController(app);
TitleController(app);
ImageDataController(app);
AuthController(app);
UserController(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

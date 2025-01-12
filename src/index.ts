import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

dotenv.config();

import FileController from './controllers/FileController';
import TitleController from './controllers/TitleController';
import ImageDataController from './controllers/ImageDataController';

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

FileController(app, upload);
TitleController(app);
ImageDataController(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

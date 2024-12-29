import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import FileController from './controllers/FileController';
import AwsService from './services/AwsService';

console.log(dotenv.config());

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const fileController = FileController();

app.use('/upload', fileController.uploadFile);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

import FileController from './controllers/FileController';
import ImageDataRepo from './repo/ImageDataRepo';

console.log(dotenv.config());

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const fileController = FileController();
const imageDataRepo = ImageDataRepo();
imageDataRepo.addBaseImageData();

app.post('/upload', upload.single('file'), fileController.uploadFile);

app.get('/', (req, res) => {
  res.json({ msg: 'working' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import * as TestController from './controllers/TestController';
import AwsService from './services/AwsService';

console.log(dotenv.config());

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const awsService = AwsService();
awsService.uploadFile();

app.use('/', TestController.testMethod);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

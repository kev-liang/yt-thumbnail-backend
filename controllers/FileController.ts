import { Request, Response } from 'express';
import AwsService from '../services/AwsService';

const FileController = () => {
  const awsService = AwsService();
  const uploadFile = async (req: Request, res: Response) => {
    res.status(200);
  };
  return { uploadFile };
};

export default FileController;

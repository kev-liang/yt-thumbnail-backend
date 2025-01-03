import { Request, Response } from 'express';
import AwsService from '../services/AwsService';

const FileController = () => {
  const awsService = AwsService();
  const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }
    try {
      const data = await awsService.uploadFile(req.file);
      if (data) {
        res.status(200).json({
          fileUrl: data.Location,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error });
    }
  };
  return { uploadFile };
};

export default FileController;

import { Request, Response, type Express } from 'express';
import AwsService from '../services/AwsService';
import ImageDataRepo from '../repo/ImageDataRepo';
import {
  upload,
  validateFileType,
  scanFile,
} from './middleware/fileMiddleware';

const FileController = (app: Express) => {
  const awsService = AwsService();
  const imageDataRepo = ImageDataRepo();

  const uploadFile = async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    } else if (!req.body.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    }
    console.log('Uploading file:', { ...req.file, buffer: undefined });
    try {
      const data = await awsService.uploadFile(req.file);
      if (data) {
        console.log('Uploaded', data);

        imageDataRepo.addBaseImageData(userId, data);

        res.status(200).json({
          fileUrl: data.Location,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error });
    }
  };

  const allowedFileTypes = ['image/jpeg', 'image/png'];

  app.post(
    '/upload-file',
    upload.single('file'),
    validateFileType(allowedFileTypes),
    scanFile,
    uploadFile
  );

  return { uploadFile };
};

export default FileController;

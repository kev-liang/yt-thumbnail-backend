import { NextFunction, Request, Response, type Express } from 'express';
import AwsService from '../services/AwsService';
import ImageDataRepo from '../repo/ImageDataRepo';
import {
  upload,
  validateFileType,
  scanFile,
} from './middleware/fileMiddleware';
import { verifyToken } from './middleware/authMiddleware';
import logger from '../helpers/logger';

const FileController = (app: Express) => {
  const awsService = AwsService();
  const imageDataRepo = ImageDataRepo();

  const uploadFile = async (req: Request, res: Response) => {
    if (!req.user?.userId || !req.file) return;
    const { userId } = req.user;
    logger.info('Uploading file:', { ...req.file }, 'User', userId);
    try {
      const data = await awsService.uploadFile(req.file);
      if (data) {
        logger.info('Uploaded', data);

        imageDataRepo.addBaseImageData(userId, data);

        res.status(200).json({
          fileUrl: data.Location,
        });
      } else {
        throw Error('No data returned from s3');
      }
    } catch (error) {
      logger.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error });
    }
  };

  const uploadFileAll = async (req: Request, res: Response) => {
    if (!req.user?.userId || !req.file) return;
    const { userId } = req.user;
    const { imageData: imageDataJsonString } = req.body;
    const imageData = JSON.parse(imageDataJsonString);
    try {
      logger.info('Uploading all images for user:', userId);
      await imageDataRepo.addExistingImageData(userId, req.file, imageData);

      res.status(200).json({
        imageData,
      });
    } catch (error) {
      logger.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file', error });
    }
  };

  const hasFileAndUserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    } else if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    }
    next();
  };

  const allowedFileTypes = ['image/jpeg', 'image/png'];

  app.post(
    '/upload-file',
    upload.single('file'),
    validateFileType(allowedFileTypes),
    scanFile,
    verifyToken,
    hasFileAndUserMiddleware,
    uploadFile
  );

  app.post(
    '/upload-file-all',
    upload.single('file'),
    validateFileType(allowedFileTypes),
    scanFile,
    verifyToken,
    hasFileAndUserMiddleware,
    uploadFileAll
  );

  return { uploadFile };
};

export default FileController;

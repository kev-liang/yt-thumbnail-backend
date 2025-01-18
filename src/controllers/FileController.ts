import { NextFunction, Request, Response, type Express } from 'express';
import AwsService from '../services/AwsService';
import ImageDataRepo from '../repo/ImageDataRepo';
import multer from 'multer';
import { fromBuffer } from 'file-type';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type!'));
    }
  },
});

// Middleware to validate file type
const validateFileType = (allowedTypes: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded!' });
        return; // Exit function
      }

      // Validate file type from buffer
      const fileType = await fromBuffer(file.buffer);
      if (!fileType || !allowedTypes.includes(fileType.mime)) {
        res.status(400).json({ error: 'Invalid file type!' });
        return; // Exit function
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error!' });
      return; // Exit function
    }
  };
};

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
    uploadFile
  );

  return { uploadFile };
};

export default FileController;

import { Request, Response } from 'express';
import AwsService from '../services/AwsService';
import ImageDataRepo from '../repo/ImageDataRepo';

const FileController = () => {
  const awsService = AwsService();
  const imageDataRepo = ImageDataRepo();

  const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }
    console.log('Uploading file:', { ...req.file, buffer: undefined });
    try {
      const data = await awsService.uploadFile(req.file);
      if (data) {
        console.log('Uploaded', data);

        imageDataRepo.addBaseImageData(data);

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

import { Request, Response, type Express } from 'express';
import ImageDataRepo from '../repo/ImageDataRepo';
import FileRepo from '../repo/FileRepo';
import { verifyToken } from './middleware/authMiddleware';

const ImageDataController = (app: Express) => {
  const imageDataRepo = ImageDataRepo();
  const fileRepo = FileRepo();

  const getImageData = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    }
    const { userId } = req.user;
    try {
      const data = await imageDataRepo.getImageData(userId);
      res.status(200).json(data);
    } catch (error) {
      console.error(`Error getting image data for user: ${userId}`);
      res.status(500).json({
        message: `Error getting image data for user: ${userId}`,
        error,
      });
    }
  };

  const deleteImageData = async (req: Request, res: Response) => {
    const { imageIds } = req.body;
    if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    }
    const { userId } = req.user;
    try {
      const deletePromises = [
        imageDataRepo.deleteImageData(userId, imageIds),
        fileRepo.deleteFiles(imageIds),
      ];
      await Promise.all(deletePromises);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({
        message: `Error deleting for user ${userId} images: ${imageIds}`,
      });
    }
  };

  const getBaseImageData = (req: Request, res: Response) => {
    res.status(200).json(imageDataRepo.getBaseImageData());
  };

  const getLastItemUpdatedTimestamp = async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    }
    const { userId } = req.user;

    const timestamp = await imageDataRepo.getLastItemUpdatedTimestamp(userId);
    res.status(200).json({ timestamp });
  };

  app.get('/image-data', verifyToken, getImageData);

  app.delete('/delete-image-data', verifyToken, deleteImageData);

  app.get('/base-image-data', getBaseImageData);

  app.get(
    '/get-last-item-updated-timestamp',
    verifyToken,
    getLastItemUpdatedTimestamp
  );

  return { getImageData };
};

export default ImageDataController;

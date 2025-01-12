import { Request, Response, type Express } from 'express';
import ImageDataRepo from '../repo/ImageDataRepo';
import FileRepo from '../repo/FileRepo';

const ImageDataController = (app: Express) => {
  const imageDataRepo = ImageDataRepo();
  const fileRepo = FileRepo();

  const getImageData = async (req: Request, res: Response) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: 'userId as string required.' });
      return;
    }
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
    const { userId } = req.query;
    const { imageIds } = req.body;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: 'userId as string required.' });
      return;
    }
    try {
      const deletePromises = [
        imageDataRepo.deleteImageData(userId, imageIds),
        fileRepo.deleteFiles(imageIds),
      ];
      await Promise.all(deletePromises);
      res.send(200);
    } catch (error) {
      res.status(500).json({
        message: `Error deleting for user ${userId} images: ${imageIds}`,
      });
    }
  };

  app.get('/image-data', getImageData);

  app.delete('/delete-image-data', deleteImageData);

  return { getImageData };
};

export default ImageDataController;

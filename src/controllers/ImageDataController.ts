import { Request, Response, type Express } from 'express';
import ImageDataRepo from '../repo/ImageDataRepo';

const ImageDataController = (app: Express) => {
  const imageDataRepo = ImageDataRepo();
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

  app.get('/image-data', getImageData);

  return { getImageData };
};

export default ImageDataController;

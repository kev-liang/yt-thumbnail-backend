import TitleRepo from '../repo/TitleRepo';
import { Request, Response, type Express } from 'express';

const TitleController = (app: Express) => {
  const titleRepo = TitleRepo();

  interface UpdateTitleReqBody {
    userId: string;
    imageId: string;
    title: string;
  }

  const addTitle = async (
    req: Request<{}, {}, UpdateTitleReqBody>,
    res: Response
  ) => {
    const { userId, imageId, title } = req.body;
    const data = await titleRepo.addTitle(userId, imageId, title);
    res.status(200).json(data?.Attributes);
  };

  const deleteTitle = async (req: Request, res: Response) => {
    const { userId, imageId, titleId } = req.query as {
      userId: string;
      imageId: string;
      titleId: string;
    };

    console.log('DELETE', userId, imageId, titleId);
    if (!userId || !imageId || !titleId) {
      res.status(400).json('Must pass userId, imageId, and titleId');
      return;
    }
    const data = await titleRepo.deleteTitle(userId, imageId, titleId);
    res.status(200).json(data?.Attributes);
  };

  app.post('/add-title', addTitle);
  app.delete('/delete-title', deleteTitle);
};

export default TitleController;

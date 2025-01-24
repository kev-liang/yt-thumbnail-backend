import TitleRepo from '../repo/TitleRepo';
import { Request, Response, type Express } from 'express';
import { verifyToken } from './middleware/authMiddleware';

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
    const { imageId, title } = req.body;
    if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    } else if (!imageId) {
      res.status(400).json({ message: 'imageId is required.' });
      return;
    } else if (!title) {
      res.status(400).json({ message: 'title is required.' });
      return;
    }

    const { userId } = req.user;
    const data = await titleRepo.addTitle(userId, imageId, title);
    res.status(200).json(data?.Attributes);
  };

  interface DeleteTitleQuery {
    imageId: string;
    titleId: string;
  }

  const deleteTitle = async (req: Request, res: Response) => {
    const { imageId, titleId } = req.query as unknown as DeleteTitleQuery;
    if (!req.user?.userId) {
      res.status(400).json({ message: 'userId is required.' });
      return;
    } else if (!imageId) {
      res.status(400).json({ message: 'imageId is required.' });
      return;
    } else if (!titleId) {
      res.status(400).json({ message: 'title is required.' });
      return;
    }
    const { userId } = req.user;

    if (!userId || !imageId || !titleId) {
      res.status(400).json('Must pass userId, imageId, and titleId');
      return;
    }
    const data = await titleRepo.deleteTitle(userId, imageId, titleId);
    res.status(200).json(data?.Attributes);
  };

  const addTitleNonLoggedIn = (req: Request, res: Response) => {
    const { title } = req.body;
    if (!title) {
      res.status(400).json('Title required');
      return;
    }
    const baseTitle = titleRepo.getBaseTitle(title);
    res.status(200).json(baseTitle);
  };

  app.post('/add-title', verifyToken, addTitle);
  app.post('/add-title-not-logged-in', addTitleNonLoggedIn);
  app.delete('/delete-title', verifyToken, deleteTitle);
};

export default TitleController;

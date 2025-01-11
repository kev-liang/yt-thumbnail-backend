import TitleRepo from '../repo/TitleRepo';
import { Request, Response } from 'express';

const TitleController = () => {
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
    res.status(200).json(data);
  };
  return { addTitle };
};

export default TitleController;

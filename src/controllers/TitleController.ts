import TitleRepo from '../repo/TitleRepo';
import { Request, Response } from 'express';

const TitleController = () => {
  const titleRepo = TitleRepo();

  interface UpdateTitleReqBody {
    imageId: string;
    title: string;
  }
  const addTitle = async (
    req: Request<{}, {}, UpdateTitleReqBody>,
    res: Response
  ) => {
    const { imageId, title } = req.body;
    const data = await titleRepo.addTitle(imageId, title);
    res.status(200).json(data);
  };
  return { addTitle };
};

export default TitleController;

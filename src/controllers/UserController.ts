import { Request, Response, type Express } from 'express';
import { addUser } from '../services/UserService';

const UserController = (app: Express) => {
  const addUserHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is missing' });
      return;
    }

    try {
      await addUser(userId);
      res.status(200).json(userId);
    } catch (error) {
      res.status(500).json({ error });
      return;
    }
  };

  app.post('/add-user/:userId', addUserHandler);
};

export default UserController;

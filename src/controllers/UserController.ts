import { Request, Response, type Express } from 'express';
import { addUser, getUser } from '../services/UserService';

const UserController = (app: Express) => {
  const addUserHandler = async (req: Request, res: Response) => {
    const { userId, email } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId is missing' });
      return;
    }
    if (!email) {
      res.status(400).json({ error: 'email is missing' });
      return;
    }

    try {
      await addUser(userId, email);
      res.status(200).json(userId);
    } catch (error) {
      res.status(500).json({ error });
      return;
    }
  };

  const getUserHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is missing' });
      return;
    }

    try {
      const user = await getUser(userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error });
      return;
    }
  };

  app.post('/add-user/', addUserHandler);
  app.get('/get-user/:userId', getUserHandler);
};

export default UserController;

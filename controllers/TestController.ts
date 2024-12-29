import { Request, Response } from "express";

export const testMethod = async (req: Request, res: Response) => {
  res.status(200);
};

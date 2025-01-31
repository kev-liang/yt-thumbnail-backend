export interface ImageData {
  PK: string;
  SK: string;
  userId: string;
  imageId: string;
  imageUrl: string;
  titles: string[];
  tags: string[];
  folders: string[];
  uploadTimestamp: string;
}

export interface TitleItem {
  id: string;
  title: string;
  uploadTimestamp: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // You can define the type of `user` here (e.g., `User`, `DecodedToken`, etc.)
    }
  }
}

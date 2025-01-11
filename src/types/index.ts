export interface ImageData {
  UserId: string;
  ImageId: string;
  Titles: string[];
  Tags: string[];
  ImageUrl: string;
}

export interface TitleItem {
  id: string;
  title: string;
  uploadTimestamp: string;
}

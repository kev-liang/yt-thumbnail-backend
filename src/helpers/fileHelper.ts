import { Readable } from 'stream';
import { ImageData } from '../types';

export const convertBase64ToFile = (buffer: Buffer, imageData: ImageData) => {
  const file = {
    buffer,
    mimetype: imageData.imageUrl.split(';')[0].split(':')[1],
    originalname: `${Date.now()}.${
      imageData.imageUrl.split(';')[0].split('/')[1]
    }`,
    size: buffer.length,
    fieldname: 'file',
    encoding: '7bit',
    destination: '',
    filename: '',
    path: '',
    stream: Readable.from(buffer),
  } as Express.Multer.File;
  return file;
};

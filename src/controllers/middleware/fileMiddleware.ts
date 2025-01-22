import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { fromBuffer } from 'file-type';
import NodeClam from 'clamscan';
import { Readable } from 'stream';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type!'));
    }
  },
});

// Middleware to validate file type
export const validateFileType = (allowedTypes: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded!' });
        return;
      }

      const fileType = await fromBuffer(file.buffer);
      if (!fileType || !allowedTypes.includes(fileType.mime)) {
        res.status(400).json({ error: 'Invalid file type!' });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error!' });
      return;
    }
  };
};

let clam: NodeClam | null = null;

(async () => {
  try {
    clam = await new NodeClam().init({
      removeInfected: false, // Do not delete infected files automatically
      clamdscan: {
        host: 'localhost',
        port: 3310,
        timeout: 60000,
      },
      debugMode: true, // Enable debug mode for troubleshooting
    });
    console.log('ClamAV initialized successfully on Windows!');
  } catch (error) {
    console.error('Failed to initialize ClamAV:', error);
  }
})();

// Middleware to scan files
export const scanFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  if (!clam) {
    res.status(400).json({ error: 'ClamAV not initialized' });
    return;
  }

  try {
    const result = await clam.scanStream(Readable.from(req.file.buffer));

    if (result.isInfected) {
      console.log('Infected file detected');
      res.status(400).json({ error: 'File is infected' });
      return;
    }

    console.log('File is clean!');
    next();
  } catch (error) {
    console.error('Error scanning file:', error);
    res.status(500).json({ error: 'Error scanning file' });
  }
};

import aws from 'aws-sdk';
import { type ImageData } from '../types';

const AwsService = () => {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  aws.config.logger = console;
  const dynamoDB = new aws.DynamoDB.DocumentClient();
  const s3 = new aws.S3();

  const uploadFile = async (file: Express.Multer.File) => {
    const params = {
      Bucket: 'yt-thumbnailer',
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const data = await s3.upload(params).promise();
      console.log('Uploaded', data);
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const addDataToDB = async (table: string, data: any) => {
    const params = {
      TableName: table,
      Item: data,
    };
    try {
      const res = await dynamoDB.put(params).promise();
      console.log('Uploaded', res);
      getItem();
    } catch (err) {
      console.error('Error uploading:', err);
    }
  };

  const getItem = async () => {
    const params = {
      TableName: 'ImageData',
      Key: {
        UserId: 'test',
      },
    };

    try {
      const data = await dynamoDB.get(params).promise();
      console.log('Retrieved item:', data);
    } catch (error) {
      console.error('Error retrieving item:', error);
    }
  };
  return { uploadFile, addDataToDB, getItem };
};

export default AwsService;

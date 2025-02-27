import aws from 'aws-sdk';
import CONSTS from '../helpers/consts';
import logger from '../helpers/logger';

const AwsService = () => {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  const dynamoDB = new aws.DynamoDB.DocumentClient();
  const s3 = new aws.S3();

  const uploadFile = async (file: Express.Multer.File) => {
    const params: aws.S3.PutObjectRequest = {
      Bucket: 'yt-thumbnailer',
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000',
    };

    try {
      const data = await s3.upload(params).promise();
      logger.info('Uploaded', data);
      return data;
    } catch (err) {
      logger.error('Error uploading file:', err);
    }
  };

  const addDataToDB = async (
    params: aws.DynamoDB.DocumentClient.PutItemInput
  ) => {
    try {
      const res = await dynamoDB.put(params).promise();
      logger.info('Uploaded', res);
      return res;
    } catch (err) {
      logger.error('Error uploading:', err);
    }
  };

  const batchGet = async (
    params: aws.DynamoDB.DocumentClient.BatchGetItemInput
  ) => {
    try {
      const data = await dynamoDB.batchGet(params).promise();
      return data;
    } catch (error) {
      logger.error('Error batch get:', error);
    }
  };

  const update = async (
    params: aws.DynamoDB.DocumentClient.UpdateItemInput
  ) => {
    try {
      const res = await dynamoDB.update(params).promise();
      logger.info('Updated item:', res);
      return res;
    } catch (err) {
      logger.error('Error updating item:', err);
    }
  };

  const query = async (
    userId: string,
    params: aws.DynamoDB.DocumentClient.QueryInput
  ) => {
    try {
      const data = await dynamoDB.query(params).promise();
      logger.info(`Successfully got data for ${userId}`);
      return data;
    } catch (err) {
      logger.error('Error querying:', err);
      throw err;
    }
  };

  const batchWrite = async (
    params: aws.DynamoDB.DocumentClient.BatchWriteItemInput
  ) => {
    try {
      const data = await dynamoDB.batchWrite(params).promise();
      return data;
    } catch (err) {
      logger.error('Error batch write:', err);
      throw err;
    }
  };

  const deleteS3Objects = async (params: aws.S3.DeleteObjectsRequest) => {
    try {
      const response = await s3.deleteObjects(params).promise();
      logger.info('Successfully deleted s3 object:', response.Deleted);
    } catch (err) {
      logger.error('Error deleting s3 object: ', err);
      throw err;
    }
  };

  return {
    uploadFile,
    addDataToDB,
    update,
    query,
    batchGet,
    batchWrite,
    deleteS3Objects,
  };
};

export default AwsService;

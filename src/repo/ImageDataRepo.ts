import AwsService from '../services/AwsService';
import CONSTS from '../helpers/consts';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const ImageDataRepo = () => {
  const awsService = AwsService();

  interface BaseImageData {
    userId: string | null;
    imageId: string | null;
    imageUrl: string | null;
    titles: string[];
    tags: string[];
    folders: string[];
    uploadTimestamp: string;
  }

  const getBaseImageData = (): BaseImageData => {
    const baseImageData = {
      userId: null,
      imageId: null,
      imageUrl: null,
      titles: [],
      tags: [],
      folders: [],
      uploadTimestamp: new Date().toISOString(),
    };
    return baseImageData;
  };

  const addBaseImageData = (
    userId: string,
    data: AWS.S3.ManagedUpload.SendData
  ) => {
    const baseImageData = getBaseImageData();
    baseImageData.userId = userId;
    baseImageData.imageId = data.Key;
    baseImageData.imageUrl = data.Location;
    const imageData = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Item: baseImageData,
    };
    try {
      awsService.addDataToDB(imageData);
    } catch (err) {
      throw err;
    }
  };

  const getImageData = async (userId: string) => {
    const queryParams: DocumentClient.QueryInput = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    };
    try {
      return awsService.query(userId, queryParams);
    } catch (err) {
      throw err;
    }
  };
  const getSingleImageData = async (userId: string, imageId: string) => {
    try {
      const params = {
        TableName: CONSTS.IMAGE_DATA_DB_NAME,
        KeyConditionExpression: 'imageId = :imageId AND userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':imageId': imageId,
        },
      };
      return awsService.query(userId, params);
    } catch (error) {
      throw error;
    }
  };

  const deleteImageData = async (userId: string, imageIds: string[]) => {
    const deleteReqs = imageIds.map((imageId) => ({
      DeleteRequest: {
        Key: {
          userId,
          imageId,
        },
      },
    }));

    const batches = [];
    while (deleteReqs.length) {
      batches.push(deleteReqs.splice(0, 25));
    }

    batches.forEach((batch) => {
      const params = {
        RequestItems: {
          [CONSTS.IMAGE_DATA_DB_NAME]: batch,
        },
      };
      try {
        return awsService.batchWrite(params);
      } catch (error) {
        throw error;
      }
    });
  };

  return {
    getBaseImageData,
    addBaseImageData,
    getImageData,
    getSingleImageData,
    deleteImageData,
  };
};

export default ImageDataRepo;

import AwsService from '../services/AwsService';
import CONSTS from '../helpers/consts';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DBO, ImageData, ImageDataDBO } from '../types';
import { convertBase64ToFile } from '../helpers/fileHelper';
import consts from '../helpers/consts';
import logger from '../helpers/logger';

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
    const imageData: ImageDataDBO = {
      ...baseImageData,
      userId,
      imageId: data.Key,
      imageUrl: data.Location,
      PK: `${CONSTS.USER_PK_PREFIX}${userId}`,
      SK: `${CONSTS.IMAGE_SK_PREFIX}${data.Key}`,
    };
    const putImageDataParams = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Item: imageData,
    };
    try {
      awsService.addDataToDB(putImageDataParams);
    } catch (err) {
      throw err;
    }
    addLastItemUpdatedTimestamp(userId);
  };

  const getImageData = async (userId: string) => {
    const queryParams: DocumentClient.QueryInput = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${CONSTS.USER_PK_PREFIX}${userId}`,
        ':prefix': CONSTS.IMAGE_SK_PREFIX,
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
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `IMAGE#${imageId}`,
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
          PK: `USER#${userId}`,
          SK: `IMAGE#${imageId}`,
        },
      },
    }));

    const batches = [];
    while (deleteReqs.length) {
      batches.push(deleteReqs.splice(0, 25));
    }

    batches.forEach(async (batch) => {
      const params = {
        RequestItems: {
          [CONSTS.IMAGE_DATA_DB_NAME]: batch,
        },
      };
      try {
        await awsService.batchWrite(params);
      } catch (error) {
        throw error;
      }
    });
    await addLastItemUpdatedTimestamp(userId);
  };

  const addExistingImageData = async (
    userId: string,
    file: Express.Multer.File,
    imageData: ImageData
  ) => {
    const data = await awsService.uploadFile(file);
    if (data) {
      const imageDataItem: ImageDataDBO = {
        ...imageData,
        userId,
        imageId: data.Key,
        imageUrl: data.Location,
        PK: `${CONSTS.USER_PK_PREFIX}${userId}`,
        SK: `${CONSTS.IMAGE_SK_PREFIX}${data.Key}`,
      };
      const putImageDataParams = {
        TableName: CONSTS.IMAGE_DATA_DB_NAME,
        Item: imageDataItem,
      };
      await Promise.all([
        awsService.addDataToDB(putImageDataParams),
        addLastItemUpdatedTimestamp(userId),
      ]);
    } else {
      throw Error('No data returned from s3');
    }
  };

  interface LastItemUpdatedTimestampDBO extends DBO {
    uploadTimestamp: string;
  }

  const addLastItemUpdatedTimestamp = async (userId: string) => {
    const timestamp = new Date().toISOString();
    const lastItemUpdatedTimestamp: LastItemUpdatedTimestampDBO = {
      PK: `${consts.USER_PK_PREFIX}${userId}`,
      SK: consts.LAST_ITEM_UPDATED_TIMESTAMP_PREFIX,
      uploadTimestamp: timestamp,
    };

    const lastItemUpdatedTimestampParams = {
      TableName: consts.IMAGE_DATA_DB_NAME,
      Item: lastItemUpdatedTimestamp,
    };

    await awsService.addDataToDB(lastItemUpdatedTimestampParams);
  };

  const getLastItemUpdatedTimestamp = async (userId: string) => {
    const params = {
      TableName: consts.IMAGE_DATA_DB_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `${CONSTS.USER_PK_PREFIX}${userId}`,
        ':sk': CONSTS.LAST_ITEM_UPDATED_TIMESTAMP_PREFIX,
      },
      ScanIndexForward: false, // Sort descending to get the latest timestamp
    };

    const { Items: lastUpdatedTimestampItem } = await awsService.query(
      userId,
      params
    );
    if (!lastUpdatedTimestampItem) return null;
    // Extract timestamp from the SK
    const timestamp = lastUpdatedTimestampItem[0].uploadTimestamp;
    logger.info('TIMESTMPA', timestamp);
    return timestamp;
  };

  return {
    getBaseImageData,
    addBaseImageData,
    getImageData,
    getSingleImageData,
    deleteImageData,
    addExistingImageData,
    addLastItemUpdatedTimestamp,
    getLastItemUpdatedTimestamp,
  };
};

export default ImageDataRepo;

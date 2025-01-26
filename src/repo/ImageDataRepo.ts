import AwsService from '../services/AwsService';
import CONSTS from '../helpers/consts';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ImageData } from '../types';
import { convertBase64ToFile } from '../helpers/fileHelper';
import consts from '../helpers/consts';

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
    const imageData: ImageData = {
      ...baseImageData,
      userId,
      imageId: data.Key,
      imageUrl: data.Location,
      PK: `${consts.USER_PK_PREFIX}${userId}`,
      SK: `${consts.IMAGE_SK_PREFIX}${data.Key}`,
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
  };

  const getImageData = async (userId: string) => {
    const queryParams: DocumentClient.QueryInput = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${consts.USER_PK_PREFIX}${userId}`,
        ':prefix': consts.IMAGE_SK_PREFIX,
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
  };

  const getUploadImagePromises = async (imageData: ImageData[]) => {
    const uploadPromises = imageData.map(async (data) => {
      // Convert base64 to buffer
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Create file object for S3 upload
      // const file = {
      //   buffer,
      //   mimetype: data.imageUrl.split(';')[0].split(':')[1],
      //   originalname: `${Date.now()}.${
      //     data.imageUrl.split(';')[0].split('/')[1]
      //   }`,
      // };
      const file = convertBase64ToFile(buffer, data);

      // Upload to S3
      const s3Data = await awsService.uploadFile(file);
      if (!s3Data) return;

      // Update image data with S3 info
      return {
        ...data,
        imageUrl: s3Data.Location,
        imageId: s3Data.Key,
      };
    });
    return uploadPromises;
  };

  const addAllImageData = async (userId: string, imageData: ImageData[]) => {
    try {
      const uploadPromises = await getUploadImagePromises(imageData);
      if (!uploadPromises) return;
      const updatedImageData = await Promise.all(uploadPromises);

      const updatedImageDataReq = {
        TableName: CONSTS.IMAGE_DATA_DB_NAME,
        Item: updatedImageData,
      };

      awsService.addDataToDB(updatedImageDataReq);
      // Batch write to DynamoDB
      // const putRequests = updatedImageData.map((data) => ({
      //   PutRequest: {
      //     Item: {
      //       userId,
      //       ...data,
      //     },
      //   },
      // }));

      // const batches = [];
      // while (putRequests.length) {
      //   batches.push(putRequests.splice(0, 25));
      // }

      // await Promise.all(
      //   batches.map((batch) =>
      //     awsService.batchWrite({
      //       RequestItems: {
      //         [CONSTS.IMAGE_DATA_DB_NAME]: batch,
      //       },
      //     })
      //   )
      // );

      // return updatedImageData;
    } catch (error) {
      console.error('Error in addAllImageData:', error);
      throw error;
    }
  };

  return {
    getBaseImageData,
    addBaseImageData,
    getImageData,
    getSingleImageData,
    deleteImageData,
    addAllImageData,
  };
};

export default ImageDataRepo;

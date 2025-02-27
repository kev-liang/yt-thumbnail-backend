import CONSTS from '../helpers/consts';
import logger from '../helpers/logger';
import AwsService from '../services/AwsService';
import { TitleItem } from '../types';
import ImageDataRepo from './ImageDataRepo';

const { v4: uuidv4 } = require('uuid');

const TitleRepo = () => {
  const awsService = AwsService();
  const imageDataRepo = ImageDataRepo();

  const getBaseTitle = (title: string) => {
    return {
      id: uuidv4(),
      title,
      uploadTimestamp: new Date().toISOString(),
    };
  };

  const addTitle = async (userId: string, imageId: string, title: string) => {
    const titleItem: TitleItem = getBaseTitle(title);

    const imageParams = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Key: {
        PK: `USER#${userId}`, // Updated Partition Key
        SK: `IMAGE#${imageId}`, // Updated Sort Key
      },
      UpdateExpression:
        'SET titles = list_append(if_not_exists(titles, :empty_list), :new_title)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':new_title': [titleItem],
      },
      ReturnValues: 'ALL_NEW',
    };
    await imageDataRepo.addLastItemUpdatedTimestamp(userId);
    const data = await awsService.update(imageParams);
    return data;
  };

  const deleteTitle = async (
    userId: string,
    imageId: string,
    titleId: string
  ) => {
    const { Items } = await imageDataRepo.getSingleImageData(userId, imageId);
    if (!Items || Items.length === 0) {
      logger.error('No image data found', userId, imageId, titleId);
      return;
    }
    const singleImageData = Items[0];
    const updatedTitles = singleImageData.titles.filter(
      (title: Record<string, string>) => title.id !== titleId
    );
    const updateParams = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Key: {
        PK: `USER#${userId}`, // Updated Partition Key
        SK: `IMAGE#${imageId}`, // Updated Sort Key
      },
      UpdateExpression: 'SET titles = :updatedTitles',
      ExpressionAttributeValues: {
        ':updatedTitles': updatedTitles,
      },
      ReturnValues: 'ALL_NEW',
    };
    await imageDataRepo.addLastItemUpdatedTimestamp(userId);
    return awsService.update(updateParams);
  };
  return { addTitle, deleteTitle, getBaseTitle };
};

export default TitleRepo;

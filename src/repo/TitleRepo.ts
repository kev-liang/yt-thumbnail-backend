import CONSTS from '../helpers/consts';
import AwsService from '../services/AwsService';
import { TitleItem } from '../types';
const { v4: uuidv4 } = require('uuid');

const TitleRepo = () => {
  const awsService = AwsService();

  const addTitle = async (userId: string, imageId: string, title: string) => {
    const titleItem: TitleItem = {
      id: uuidv4(),
      title: title,
      uploadTimestamp: new Date().toISOString(),
    };

    const imageParams = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Key: {
        userId: userId,
        imageId: imageId,
      },
      UpdateExpression:
        'SET titles = list_append(if_not_exists(titles, :empty_list), :new_title)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':new_title': [titleItem],
      },
      ReturnValues: 'ALL_NEW',
    };
    const data = await awsService.update(imageParams);
    return data;
  };
  return { addTitle };
};

export default TitleRepo;

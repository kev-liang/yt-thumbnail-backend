import consts from '../helpers/consts';
import { DBO } from '../types';
import AwsService from './AwsService';

interface UserDBO extends DBO {
  isPaid: boolean;
  email: string;
}

const awsService = AwsService();

export const addUser = async (userId: string, email: string) => {
  const user: UserDBO = {
    PK: `${consts.USER_PK_PREFIX}${userId}`,
    SK: 'METADATA',
    isPaid: false,
    email,
  };

  const userParams = {
    TableName: consts.IMAGE_DATA_DB_NAME,
    Item: user,
  };

  try {
    const res = await awsService.addDataToDB(userParams);
    return res;
  } catch (err) {
    throw err;
  }
};

export const getUser = async (userId: string) => {
  const userParams = {
    TableName: consts.IMAGE_DATA_DB_NAME,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `${consts.USER_PK_PREFIX}${userId}`,
      ':sk': consts.USER_SK_PREFIX,
    },
  };

  return awsService.query(userId, userParams);
};

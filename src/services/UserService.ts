import consts from '../helpers/consts';
import { DBO } from '../types';
import AwsService from './AwsService';

interface UserDBO extends DBO {
  isPaid: boolean;
}

export const addUser = async (userId: string) => {
  const awsService = AwsService();

  const user: UserDBO = {
    PK: `${consts.USER_PK_PREFIX}${userId}`,
    SK: 'METADATA',
    isPaid: false,
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

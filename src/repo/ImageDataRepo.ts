import AwsService from '../services/AwsService';
import CONSTS from '../helpers/consts';

const ImageDataRepo = () => {
  const awsService = AwsService();

  const addBaseImageData = (
    userId: string,
    data: AWS.S3.ManagedUpload.SendData
  ) => {
    const imageData = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      Item: {
        UserId: userId,
        ImageId: data.Key,
        ImageUrl: data.Location,
        Titles: [],
        Tags: [],
        Folders: [],
        UploadTimestamp: new Date().toISOString(),
      },
    };
    try {
      awsService.addDataToDB(imageData);
    } catch (err) {
      throw err;
    }
  };

  const getImageData = (userId: string) => {
    const queryParams = {
      TableName: CONSTS.IMAGE_DATA_DB_NAME,
      KeyConditionExpression: 'UserId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };
    try {
      return awsService.queryRecordsByUserId(userId, queryParams);
    } catch (err) {
      throw err;
    }
  };

  return { addBaseImageData, getImageData };
};

export default ImageDataRepo;

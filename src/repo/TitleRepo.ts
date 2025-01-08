import CONSTS from '../helpers/consts';
import AwsService from '../services/AwsService';
const { v4: uuidv4 } = require('uuid');

const TitleRepo = () => {
  const awsService = AwsService();

  const addTitle = async (imageId: string, title: string) => {
    const imageParams = {
      TableName: CONSTS.IMAGE_TITLE_DB_NAME,
      Item: {
        ImageId: imageId,
        Title: title,
        TitleId: uuidv4(),
        UploadTimestamp: new Date().toISOString(),
      },
    };
    const data = await awsService.addDataToDB(imageParams);
    return data;
  };
  return { addTitle };
};

export default TitleRepo;

import AwsService from '../services/AwsService';
const { v4: uuidv4 } = require('uuid');

const TitleRepo = () => {
  const tableName = 'ImageTitles';
  const awsService = AwsService();
  const addTitle = async (imageId: string, title: string) => {
    const imageTitle = {
      ImageId: imageId,
      Title: title,
      TitleId: uuidv4(),
      UploadTimestamp: new Date().toISOString(),
    };
    const data = await awsService.addDataToDB(tableName, imageTitle);
    return data;
  };
  return { addTitle };
};

export default TitleRepo;

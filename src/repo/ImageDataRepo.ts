import AwsService from '../services/AwsService';

const ImageDataRepo = () => {
  const tableName = 'ImageData';
  const awsService = AwsService();

  const addBaseImageData = () => {
    const data = {
      UserId: 'test',
      ImageId: 'testImage',
      ImageUrl: 'testurl',
    };
    awsService.addDataToDB(tableName, data);
  };
  return { addBaseImageData };
};

export default ImageDataRepo;

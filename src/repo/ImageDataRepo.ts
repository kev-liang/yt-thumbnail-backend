import AwsService from '../services/AwsService';

const ImageDataRepo = () => {
  const tableName = 'ImageData';
  const awsService = AwsService();

  const addBaseImageData = (
    userId: string,
    data: AWS.S3.ManagedUpload.SendData
  ) => {
    const imageData = {
      UserId: userId,
      ImageId: data.Key,
      ImageUrl: data.Location,
      Titles: [],
      Tags: [],
      Folders: [],
      UploadTimestamp: new Date().toISOString(),
    };
    awsService.addDataToDB(tableName, imageData);
  };

  return { addBaseImageData };
};

export default ImageDataRepo;

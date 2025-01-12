import CONSTS from '..//helpers/consts';
import AwsService from '../services/AwsService';

const FileRepo = () => {
  const awsService = AwsService();
  const deleteFiles = (imageUrls: string[]) => {
    const params = {
      Bucket: CONSTS.THUMBNAIL_BUCKET_NAME,
      Delete: {
        Objects: imageUrls.map((imageUrl) => ({
          Key: imageUrl,
        })),
      },
    };
    try {
      return awsService.deleteS3Objects(params);
    } catch (err) {
      throw err;
    }
  };

  return { deleteFiles };
};

export default FileRepo;

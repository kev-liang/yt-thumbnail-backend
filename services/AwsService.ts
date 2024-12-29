import aws from 'aws-sdk';

const AwsService = () => {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const s3 = new aws.S3();

  const uploadFile = async () => {
    const params = {
      Bucket: 'yt-thumbnailer',
      Key: 'example.txt',
      Body: 'AWSS',
    };

    try {
      const data = await s3.upload(params).promise();
      console.log('Uploaded', data);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };
  return { uploadFile };
};

export default AwsService;

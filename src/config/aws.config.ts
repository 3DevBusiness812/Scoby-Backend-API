import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('aws', () => ({
  accessKeyId: env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: env.AWS_ACCESS_KEY_SECRET as string,
  snsSenderId: env.AWS_SNS_SENDER_ID as string,
  region: env.AWS_REGION as string,
  disableSmsSending: env.AWS_DISABLE_SMS_SENDING === 'true',
  s3UserProfileAssetsBucket: env.AWS_S3_USER_PROFILE_ASSETS_BUCKET as string,
  s3BaseUrl: env.AWS_S3_BASE_URL as string,
}));

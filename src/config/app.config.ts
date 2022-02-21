import { registerAs } from '@nestjs/config';
import ms from 'ms';

const { env } = process;

export default registerAs('app', () => ({
  port: env.APP_PORT as string,
  verificationCodeExpire: ms(env.APP_VERIFICATION_CODE_EXPIRE as string),
  jwtSecret: env.APP_JWT_SECRET as string,
  registrationJwtExpire: env.APP_REGISTRATION_JWT_EXPIRE as string,
  authorizationJwtExpire: env.APP_AUTHORIZATION_JWT_EXPIRE as string,
  sessionJwtExpire: env.APP_SESSION_JWT_EXPIRE as string,
  resetPasswordJwtExpire: env.APP_RESET_PASSWORD_JWT_EXPIRE as string,
  userImagesUploadSizeLimit: Number(env.APP_USER_IMAGES_UPLOAD_SIZE_LIMIT),
  userAvatarMaxDimension: Number(env.APP_USER_AVATAR_MAX_DIMENSION),
  userBackgroundImageMaxDimension: Number(
    env.APP_USER_BACKGROUND_IMAGE_MAX_DIMENSION,
  ),
  minUserAge: Number(env.APP_MIN_USER_AGE),
}));

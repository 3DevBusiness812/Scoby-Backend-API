import * as Joi from '@hapi/joi';

export const EnvSchema = Joi.object({
  // Database & TypeORM CLI
  TYPEORM_CONNECTION: Joi.string().required(),
  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_PORT: Joi.string().required(),
  TYPEORM_USERNAME: Joi.string().required(),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),

  // TypeORM CLI Only
  TYPEORM_ENTITIES: Joi.string().required(),
  TYPEORM_MIGRATIONS: Joi.string().required(),
  TYPEORM_MIGRATIONS_DIR: Joi.string().required(),

  // Application
  APP_PORT: Joi.string().required(),
  APP_VERIFICATION_CODE_EXPIRE: Joi.string().required(),
  APP_JWT_SECRET: Joi.string().required(),
  APP_REGISTRATION_JWT_EXPIRE: Joi.string().required(),
  APP_AUTHORIZATION_JWT_EXPIRE: Joi.string().required(),
  APP_SESSION_JWT_EXPIRE: Joi.string().required(),
  APP_RESET_PASSWORD_JWT_EXPIRE: Joi.string().required(),
  APP_USER_IMAGES_UPLOAD_SIZE_LIMIT: Joi.number().required(),
  APP_USER_AVATAR_MAX_DIMENSION: Joi.number().required(),
  APP_USER_BACKGROUND_IMAGE_MAX_DIMENSION: Joi.number().required(),
  APP_MIN_USER_AGE: Joi.number().required(),

  // AWS
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_ACCESS_KEY_SECRET: Joi.string().required(),
  AWS_SNS_SENDER_ID: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_DISABLE_SMS_SENDING: Joi.boolean(),
  AWS_S3_USER_PROFILE_ASSETS_BUCKET: Joi.string().required(),
  AWS_S3_BASE_URL: Joi.string().required(),

  // MQ
  MQ_HOST: Joi.string().required(),
  MQ_SPARE_HOST: Joi.string(),
  MQ_PORT: Joi.number().required(),
  MQ_USERNAME: Joi.string().required(),
  MQ_PASSWORD: Joi.string().required(),
  MQ_SSL: Joi.boolean().required(),
  MQ_API_SESSION_USERS_QUEUE: Joi.string().required(),
  MQ_MS_SESSION_USERS_QUEUE: Joi.string().required(),

  // KARTRA
  KARTRA_APP_ID: Joi.string().required(),
  KARTRA_API_KEY: Joi.string().required(),
  KARTRA_API_PASSWORD: Joi.string().required(),
  KARTRA_API_URL: Joi.string().required(),
  KARTRA_DISABLE_LEADS: Joi.boolean(),

  // Firebase
  FB_SERVICE_ACCOUNT: Joi.string().base64().required(),
  FB_DATABASE_URL: Joi.string().uri().required(),

  // Opentok / Vonage video API
  OPENTOK_API_KEY: Joi.string().required(),
  OPENTOK_API_SECRET: Joi.string().required(),
});

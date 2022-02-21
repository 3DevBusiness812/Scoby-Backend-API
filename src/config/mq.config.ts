import { registerAs } from '@nestjs/config';

const { env } = process;

const mq = () => ({
  host: env.MQ_HOST as string,
  spareHost: env.MQ_SPARE_HOST,
  port: Number(env.MQ_PORT),
  username: env.MQ_USERNAME as string,
  password: env.MQ_PASSWORD as string,
  ssl: env.MQ_SSL === 'true',
  queues: {
    apiSessionUsersQueue: env.MQ_API_SESSION_USERS_QUEUE as string,
    msSessionUsersQueue: env.MQ_MS_SESSION_USERS_QUEUE as string,
  },
});

export type MqConfig = ReturnType<typeof mq>;

export default registerAs('mq', mq);

import { registerAs } from '@nestjs/config';

const { env } = process;

const firebase = () => ({
  serviceAccount: env.FB_SERVICE_ACCOUNT as string,
  databaseUrl: env.FB_DATABASE_URL as string,
});

export type FirebaseConfig = ReturnType<typeof firebase>;

export default registerAs('firebase', firebase);

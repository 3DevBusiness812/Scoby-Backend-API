import { registerAs } from '@nestjs/config';

const { env } = process;

const kartra = () => ({
  appId: env.KARTRA_APP_ID as string,
  apiKey: env.KARTRA_API_KEY as string,
  apiPassword: env.KARTRA_API_PASSWORD as string,
  apiUrl: env.KARTRA_API_URL as string,
  disableLeads: env.KARTRA_DISABLE_LEADS === 'true',
});

export type KartraConfig = ReturnType<typeof kartra>;

export default registerAs('kartra', kartra);

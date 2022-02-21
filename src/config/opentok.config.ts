import { registerAs } from '@nestjs/config';

const { env } = process;

const opentok = () => ({
  API_KEY: env.OPENTOK_API_KEY as string,
  API_SECRET: env.OPENTOK_API_SECRET as string,
});

export type OpentokConfig = ReturnType<typeof opentok>;

export default registerAs('opentok', opentok);

import { registerAs } from '@nestjs/config';
import * as path from 'path';

const { env } = process;

export default registerAs('db', () => ({
  type: env.TYPEORM_CONNECTION as string,
  host: env.TYPEORM_HOST as string,
  port: env.TYPEORM_PORT as string,
  username: env.TYPEORM_USERNAME as string,
  password: env.TYPEORM_PASSWORD as string,
  database: env.TYPEORM_DATABASE as string,
  entities: [path.resolve(process.cwd(), 'dist/**/*.entity.js')]
}));

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const configService = app.get(ConfigService);
  await app.listen(process.env.PORT || configService.get('app.port') as string);
}

bootstrap().catch((e) => {
  process.nextTick(() => {
    throw e;
  });
});

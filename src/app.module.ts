import { Module, Logger, Injectable } from '@nestjs/common';
import * as path from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PingModule } from './ping/ping.module';
import config from './config';
import { UsersModule } from './users/users.module';
import { JwtModule } from './lib/jwt/jwt.module';
import { ScryptModule } from './lib/scrypt/scrypt.module';
import { EnvSchema } from './config/env.schema';
import { SmsModule } from './lib/sms/sms.module';
import { APP_FILTER } from '@nestjs/core';
import { ValidationErrorFilter } from './lib/common/validation-error.filter';
import { TopicsModule } from './topics/topics.module';
import { S3Module } from './lib/s3/s3.module';
import { ImageProcessorModule } from './lib/image-processor/image-processor.module';
import { SessionsModule } from './sessions/sessions.module';
import { MqModule } from './lib/mq/mq.module';
import { KartraModule } from './lib/kartra/kartra.module';
import { ScheduleModule } from '@nestjs/schedule';
import { v4 as uuidV4 } from 'uuid';

import { Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
  BaseContext,
} from 'apollo-server-plugin-base';
import { GraphQLRequestContextWillSendResponse } from 'apollo-server-types';
import { logMemoryUsage } from './lib/common/common.utils';
import { FirebaseModule } from './lib/firebase/firebase.module';
import { PushTokensModule } from './push-tokens/push-tokens.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VersionsModule } from './versions/versions.module';
import { VonageModule } from './vonage/vonage.module';
import {ActivityModule} from './activity/activity.module';
import { ChatModule } from './chat/chat.module';
import { SeriesModule } from './series/series.module';
import {TeamModule} from './team/team.module'
import { EventsModule } from './events/events.module';

@Plugin()
@Injectable()
export class LoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(LoggingPlugin.name);

  requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>,
  ): GraphQLRequestListener {
    const id = uuidV4();

    this.logger.log(`>>> GRAPHQL REQUEST: id ${id} - query`, requestContext.request.query);

    return {
      willSendResponse(
        requestContext: GraphQLRequestContextWillSendResponse<any>,
      ) : any {
        this.logger.error(`>>> GRAPHQL RESPONSE: id ${id} - errors`, requestContext.response.errors);

        logMemoryUsage();
      },
    };
  }
}

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: path.resolve(process.cwd(), './src/schema.graphql'),
      sortSchema: true,
      installSubscriptionHandlers: true,
      context: ({ req, connection }) => connection ? { req: { headers: connection.context } } : { req },
      // plugins: [new LoggingPlugin()],
    }),
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
      load: config,
      validationSchema: EnvSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...(configService.get('db') as TypeOrmModuleOptions),
        logging: 'all',
      }),
    }),
    ScheduleModule.forRoot(),
    PingModule,
    UsersModule,
    JwtModule,
    ScryptModule,
    SmsModule,
    TopicsModule,
    S3Module,
    ImageProcessorModule,
    SessionsModule,
    MqModule,
    KartraModule,
    FirebaseModule,
    PushTokensModule,
    NotificationsModule,
    VersionsModule,
    VonageModule,
    ActivityModule,
    ChatModule,
    SeriesModule,
    TeamModule,
    EventsModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationErrorFilter,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsResolver } from './sessions.resolver';
import { JwtModule } from '../lib/jwt/jwt.module';
import { PubSub } from 'graphql-subscriptions';
import { MqModule } from '../lib/mq/mq.module';
import { SessionsCronService } from './sessions-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TopicsModule } from '../topics/topics.module';
import { VonageModule } from 'src/vonage/vonage.module';
import {ActivityModule} from 'src/activity/activity.module';

@Module({
  imports: [JwtModule, MqModule, NotificationsModule, TopicsModule, VonageModule,ActivityModule],
  providers: [
    SessionsService,
    SessionsResolver,
    { provide: PubSub, useValue: new PubSub() },
    SessionsCronService,
  ],
  exports: [SessionsService]
})
export class SessionsModule {}

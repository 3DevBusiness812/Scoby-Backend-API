import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtModule } from 'src/lib/jwt/jwt.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ActivityModule } from 'src/activity/activity.module';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { ChatMessageResolver } from './chatMessages.resolver';

@Module({
  imports: [JwtModule, NotificationsModule, ActivityModule],
  providers: [
    ChatService,
    ChatResolver,
    ChatMessageResolver,
    { provide: PubSub, useValue: new PubSub() },
  ],
})
export class ChatModule {}

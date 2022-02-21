import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from '../lib/firebase/firebase.module';
import { PushTokensModule } from '../push-tokens/push-tokens.module';

@Module({
  imports: [FirebaseModule, PushTokensModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

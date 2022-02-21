import { Module } from '@nestjs/common';
import { JwtModule } from '../lib/jwt/jwt.module';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ImageProcessorModule } from '../lib/image-processor/image-processor.module';
import { ActivityModule } from 'src/activity/activity.module';
import { S3Module } from '../lib/s3/s3.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    JwtModule,
    NotificationsModule,
    ImageProcessorModule,
    ActivityModule,
    S3Module,
    SessionsModule,
  ],
  providers: [EventsResolver, EventsService],
  exports: [EventsService],
})
export class EventsModule {}

import { Module } from '@nestjs/common';
import { SeriesServices } from './series.service';
import { SeriesResolver } from './series.resolver';
import { JwtModule } from '../lib/jwt/jwt.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ImageProcessorModule } from '../lib/image-processor/image-processor.module';
import { S3Module } from '../lib/s3/s3.module';
import { ActivityModule } from 'src/activity/activity.module';
import { KartraModule } from '../lib/kartra/kartra.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    JwtModule,
    NotificationsModule,
    ImageProcessorModule,
    ActivityModule,
    SessionsModule,
    S3Module,
    KartraModule,
    EventsModule
  ],
  providers: [SeriesServices, SeriesResolver],
  exports: [SeriesServices],
})
export class SeriesModule {}

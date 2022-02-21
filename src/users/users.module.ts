import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { JwtModule } from '../lib/jwt/jwt.module';
import { ScryptModule } from '../lib/scrypt/scrypt.module';
import { SmsModule } from '../lib/sms/sms.module';
import { TopicsModule } from '../topics/topics.module';
import { SeriesModule } from 'src/series/series.module';
import { S3Module } from '../lib/s3/s3.module';
import { ImageProcessorModule } from '../lib/image-processor/image-processor.module';
import { KartraModule } from '../lib/kartra/kartra.module';
import { ProfileCreationResolver } from './profile-creation.resolver';
import { SessionsModule } from '../sessions/sessions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecommendationUsers } from './recommendationUsers.service';

@Module({
  imports: [
    JwtModule,
    ScryptModule,
    SmsModule,
    TopicsModule,
    SeriesModule,
    S3Module,
    ImageProcessorModule,
    KartraModule,
    SessionsModule,
    NotificationsModule,
    RecommendationUsers,

  ],
  providers: [UsersService, UsersResolver, ProfileCreationResolver,RecommendationUsers],
  exports: [UsersService]
})
export class UsersModule {}

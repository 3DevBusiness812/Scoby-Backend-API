import { Module } from '@nestjs/common';
import { ActivityServices } from './activity.service';
import { ActivityResolver } from './activity.resolver';
import { JwtModule } from '../lib/jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [ActivityServices, ActivityResolver],
  exports: [ActivityServices],
})
export class ActivityModule {}

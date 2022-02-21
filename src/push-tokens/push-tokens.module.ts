import { Module } from '@nestjs/common';
import { PushTokensService } from './push-tokens.service';
import { PushTokensResolver } from './push-tokens.resolver';
import { JwtModule } from '../lib/jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [PushTokensService, PushTokensResolver],
  exports: [PushTokensService],
})
export class PushTokensModule {}

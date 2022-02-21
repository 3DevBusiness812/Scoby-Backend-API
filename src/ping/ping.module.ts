import { Module } from '@nestjs/common';
import { PingResolver } from './ping.resolver';
import { PingService } from './ping.service';

@Module({
  providers: [PingResolver, PingService],
})
export class PingModule {}

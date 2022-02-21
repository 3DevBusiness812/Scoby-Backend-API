import { Module } from '@nestjs/common';
import { KartraService } from './kartra.service';

@Module({
  providers: [KartraService],
  exports: [KartraService],
})
export class KartraModule {}

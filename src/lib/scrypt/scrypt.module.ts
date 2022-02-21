import { Module } from '@nestjs/common';
import { ScryptService } from './scrypt.service';

@Module({
  providers: [ScryptService],
  exports: [ScryptService],
})
export class ScryptModule {}

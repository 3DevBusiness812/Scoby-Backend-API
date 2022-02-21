import { Injectable } from '@nestjs/common';
import { Ping } from './ping.graphql';

@Injectable()
export class PingService {
  ping(): Ping {
    return {
      ping: 'pong',
    };
  }
}

import { Query, Resolver } from '@nestjs/graphql';
import { Ping } from './ping.graphql';
import { PingService } from './ping.service';

@Resolver('Ping')
export class PingResolver {
  constructor(private pingService: PingService) {}

  @Query(() => Ping)
  ping(): Ping {
    return this.pingService.ping();
  }
}

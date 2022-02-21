import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PushTokenCreation, PushTokenObject } from './push-tokens.graphql';
import { PushTokensService } from './push-tokens.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';

@Resolver(() => PushTokenObject)
export class PushTokensResolver {
  constructor(private pushTokensService: PushTokensService) {}

  @Mutation(() => PushTokenObject)
  @UseGuards(JwtGuard)
  async addPushToken(
    @Args() args: PushTokenCreation,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<PushTokenObject> {
    return this.pushTokensService.addPushToken(
      currentUser.id,
      args.deviceId,
      args.token,
    );
  }
}

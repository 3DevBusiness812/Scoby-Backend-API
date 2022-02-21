import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { ActivityServices } from './activity.service';
import { JwtGuard } from '../lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { PagingPipe } from '../lib/common/common.pipe';
import { BasePayload } from '../lib/jwt/jwt.service';
import { UseGuards } from '@nestjs/common';
import { PagingInput } from '../lib/common/common.graphql';
import { Paging } from '../lib/common/common.interfaces';
import { UsePipes } from '@nestjs/common';
import { getActivity, ActivityCounter } from './activity.graphql';
@Resolver('Activity')
export class ActivityResolver {
  constructor(private activityServices: ActivityServices) {}

  @Query(() => getActivity)
  @UsePipes(PagingPipe)
  @UseGuards(JwtGuard)
  async getActivity(
    @CurrentUser() currentUser: BasePayload,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<getActivity> {
    return this.activityServices.getActivity(currentUser.id, paging);
  }

  @Query(() => ActivityCounter)
  @UseGuards(JwtGuard)
  async getCounterActivity(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<ActivityCounter> {
    return this.activityServices.getCounterActivity(currentUser.id);
  }

  @Mutation(() => ActivityCounter)
  @UseGuards(JwtGuard)
  async deleteCounterActivity(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<ActivityCounter> {
    return this.activityServices.deleteCounterActivity(currentUser.id);
  }
}

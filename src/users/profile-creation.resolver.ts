import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  FollowCounts,
  FollowStats,
  UserProfile,
  UserProfileWithAuth,
} from './users.graphql';
import { Topic } from '../topics/topic.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';

@Resolver(() => UserProfileWithAuth)
export class ProfileCreationResolver {
  constructor(private usersService: UsersService) {}

  @ResolveField('topics', () => [Topic])
  async topics(@Parent() userProfile: UserProfileWithAuth): Promise<Topic[]> {
    return this.usersService.getUserTopics(userProfile.id);
  }

  @ResolveField('followCounts', () => FollowCounts)
  async followCounts(
    @Parent() userProfile: UserProfile,
  ): Promise<FollowCounts> {
    return this.usersService.getFollowCounts(userProfile);
  }

  @ResolveField('followStats', () => FollowStats)
  async followStats(
    @Parent() userProfile: UserProfile,
    @CurrentUser() currentUser: BasePayload | undefined,
  ): Promise<FollowStats> {
    return this.usersService.getFollowStats(userProfile, currentUser?.id);
  }
}

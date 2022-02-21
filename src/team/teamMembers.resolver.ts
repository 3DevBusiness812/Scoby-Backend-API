import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserProfile } from 'src/users/users.graphql';
import { TeamMemberObject, TeamObject } from './team.graphql';
import { TeamService } from './team.service';

@Resolver(() => TeamMemberObject)
export class TeamMembersResolver {
  constructor(private teamService: TeamService) {}

  @ResolveField('user', () => UserProfile)
  async invitedUser(
    @Parent() teamMember: TeamMemberObject,
  ): Promise<UserProfile> {
    return this.teamService.getInvitedUser(teamMember.id);
  }

  @ResolveField('team', () => TeamObject)
  async targetTeam(
    @Parent() teamMember: TeamMemberObject,
  ): Promise<TeamObject> {
    return this.teamService.getTargetTeam(teamMember.id);
  }
}

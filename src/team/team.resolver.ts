import { Resolver, Mutation, Args, Int, Query } from '@nestjs/graphql';
import { JwtGuard } from '../lib/jwt/jwt.guard';
import { CurrentTeam, CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';
import { UseGuards, UsePipes } from '@nestjs/common';
import {
  TeamMemberObject,
  TeamObject,
  TeamCreation,
  TeamUpdate,
  EditTeam,
  PaginatedTeams,
} from './team.graphql';
import { TeamService } from './team.service';
import { TeamCreationPipe } from './team.pipe';
import {
  ApproveRequestTeamGuard,
  DeleteJoinRequestTeamGuard,
  DeleteTeamGuard,
  EditTeamGuard,
  InviteMembersGuard,
  JoinRequestTeamGuard,
  UpdateTeamGuard,
} from './team.guard';
import { GraphQLUpload } from 'apollo-server-express';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { Team } from './team.entity';
import { PagingPipe } from 'src/lib/common/common.pipe';
import { PagingInput } from 'src/lib/common/common.graphql';

@Resolver('Team')
export class TeamResolver {
  constructor(private teamService: TeamService) {}

  @Mutation(() => TeamObject)
  @UseGuards(JwtGuard)
  @UsePipes(TeamCreationPipe)
  async createTeam(
    @CurrentUser() currentUser: BasePayload,
    @Args('team') team: TeamCreation,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<TeamObject> {
    return this.teamService.createTeam(
      currentUser.id,
      team,
      avatar,
      backgroundImage,
    );
  }

  @Query(() => [TeamMemberObject])
  @UseGuards(JwtGuard)
  async getUserInvites(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<TeamMemberObject[]> {
    return this.teamService.getUserInvites(currentUser.id);
  }

  @Query(() => TeamObject)
  @UseGuards(JwtGuard)
  async getTeam(
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
  ): Promise<TeamObject> {
    return this.teamService.getTeamById(teamId);
  }

  @Mutation(() => TeamObject)
  @UseGuards(InviteMembersGuard)
  async inviteMembers(
    @Args('usersIds', { nullable: false, type: () => [Int] })
    usersIds: number[],
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
    @CurrentUser() curentUser: BasePayload,
  ): Promise<TeamObject> {
    return this.teamService.inviteUsers(usersIds, teamId, curentUser.id);
  }

  @Mutation(() => TeamObject)
  @UseGuards(UpdateTeamGuard)
  async updateTeamGeneralInfo(
    @Args('updateTeamPayload') updateTeamPayload: TeamUpdate,
    @CurrentTeam() currentTeam: Team,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<TeamObject> {
    return this.teamService.updateTeam(
      updateTeamPayload,
      currentTeam,
      currentUser?.id,
    );
  }

  @Mutation(() => TeamObject)
  @UseGuards(DeleteTeamGuard)
  async deleteTeam(
    @Args('teamId', { nullable: false, type: () => Int }) teamId: number,
  ): Promise<TeamObject> {
    return this.teamService.deleteTeam(teamId);
  }

  @Mutation(() => TeamObject)
  @UseGuards(EditTeamGuard)
  async editTeam(
    @CurrentUser() currentUser: BasePayload,
    @Args('editTeamPayload') editTeamPayload: EditTeam,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<TeamObject> {
    return this.teamService.editTeam(
      editTeamPayload,
      currentUser.id,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => TeamMemberObject)
  @UseGuards(JwtGuard)
  async acceptInvite(
    @CurrentUser() currentUser: BasePayload,
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
  ): Promise<TeamMemberObject> {
    return this.teamService.acceptInvite(currentUser.id, teamId);
  }

  @Mutation(() => TeamMemberObject)
  @UseGuards(JwtGuard)
  async leaveTeam(
    @CurrentUser() currentUser: BasePayload,
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
  ): Promise<TeamMemberObject> {
    return this.teamService.leave(currentUser.id, teamId);
  }

  @Mutation(() => TeamObject)
  @UseGuards(JoinRequestTeamGuard)
  async joinRequest(
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
    @CurrentTeam() currentTeam: Team,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<TeamObject> {
    return this.teamService.joinRequest(currentUser.id, currentTeam);
  }

  @Mutation(() => TeamObject)
  @UseGuards(DeleteJoinRequestTeamGuard)
  async deleteJoinRequest(
    @Args('teamId', { nullable: false, type: () => Int })
    teamId: number,
    @Args('userId', { nullable: false, type: () => Int })
    userId: number,
  ): Promise<TeamObject> {
    return this.teamService.deleteJoinRequest(userId, teamId);
  }

  @Query(() => PaginatedTeams)
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getAllTeams(
    @Args('paging', { type: () => PagingInput, nullable: false })
    paging: Paging,
    @Args('query', { type: () => String, nullable: true }) query: string,
  ): Promise<PaginatedTeams> {
    return this.teamService.getTeams(paging, query);
  }

  @Query(() => PaginatedTeams)
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getUsersTeams(
    @Args('paging', { type: () => PagingInput, nullable: false })
    paging: Paging,
    @Args('query', { type: () => String, nullable: true }) query: string,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<PaginatedTeams> {
    return this.teamService.getUserTeams(paging, query, currentUser.id)
  }

  @Mutation(() => TeamObject)
  @UseGuards(ApproveRequestTeamGuard)
  async approveJoinRequest(
    @Args('applicantId', {type: () => Int, nullable: false})
    applicantId: number,
    @Args('teamId', {type: () => Int, nullable: false})
    teamId: number,
    @CurrentTeam() currentTeam: Team,
  ): Promise<TeamObject> {
    return this.teamService.approveJoinRequest(currentTeam, applicantId)
  }
}
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { IJwtGuard } from 'src/lib/common/common.interfaces';
import { JWT_ERRORS } from 'src/lib/jwt/jwt.messages';
import { JwtService, JwtType } from 'src/lib/jwt/jwt.service';
import { Team } from './team.entity';
import { TeamUpdate } from './team.graphql';
import { TEAM_ERRORS } from './team.messages';
import { TeamService } from './team.service';
import { ITeamMembersIds } from './team.types';

abstract class JwtGuard {
  constructor(private JwtService: JwtService) {}

  protected async authGuard(context: ExecutionContext): Promise<IJwtGuard> {
    const ctx = GqlExecutionContext.create(context);

    const authHeaderContent =
      ctx.getContext().req?.headers['authorization'] ??
      ctx.getContext().req?.headers['Authorization'];

    if (!authHeaderContent) {
      throw new ApolloError(
        JWT_ERRORS.UNAUTHORIZED.MESSAGE,
        JWT_ERRORS.UNAUTHORIZED.CODE,
      );
    }

    const [headerType, token] = authHeaderContent.split(' ');

    if (headerType !== 'Bearer') {
      throw new ApolloError(
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.MESSAGE,
        JWT_ERRORS.INVALID_AUTHORIZATION_HEADER.CODE,
      );
    }

    const user = await this.JwtService.verify(token, JwtType.AUTHORIZATION);
    ctx.getContext().req.user = user;

    return { user, ctx };
  }
}

@Injectable()
export class TeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async getMembersIds(teamId: number): Promise<ITeamMembersIds> {
    const team = await this.teamService.getTeamById(teamId);
    const ids = team.members.map(({ id }) => id);
    return { team, ids };
  }

  private async getUsersIds(membersIds: number[]): Promise<number[]> {
    const users = await this.teamService.getMembers(membersIds);
    return users.map(({ user }) => user.id);
  }

  async teamCheck(teamId: number, userId: number): Promise<boolean> {
    const { ids, team } = await this.getMembersIds(teamId);
    const usersIds = await this.getUsersIds(ids);

    return [team?.ownerUser?.id, ...usersIds].some((item) => item === userId);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const teamId = ctx.getArgByIndex(1).teamId;
    const check = await this.teamCheck(teamId, user.id);

    return check;
  }
}

@Injectable()
export class InviteMembersGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async getMembersIds(teamId: number): Promise<number[]> {
    const team = await this.teamService.getTeamById(teamId);
    const ids = team.members.map(({ id }) => id);
    return ids;
  }

  private async CheckUsersIdsForExistingInTeam(
    membersIds: number[],
    invitedUsersIds: number[],
  ): Promise<void> {
    const users = await this.teamService.getMembers(membersIds);
    const usersIds = users.map(({ user }) => user.id);
    const notUnique = invitedUsersIds
      .map((invitedId) => usersIds.some((membersId) => invitedId === membersId))
      .some((item) => item);

    if (notUnique) {
      throw new ApolloError(
        TEAM_ERRORS.USER_ALREADY_INVITED.MESSAGE,
        TEAM_ERRORS.USER_ALREADY_INVITED.CODE,
      );
    }
  }

  private async inviteCheck(
    usersIds: number[],
    teamId: number,
    currentUser: number,
  ): Promise<void> {
    const team = await this.teamService.getTeamById(teamId);

    if (!team || !usersIds || !currentUser) {
      throw new ApolloError(
        TEAM_ERRORS.WRONG_REQUEST_PAYLOAD.MESSAGE,
        TEAM_ERRORS.WRONG_REQUEST_PAYLOAD.CODE,
      );
    }

    if (!team.membersAllowedToInvite && team.ownerUser.id !== currentUser) {
      throw new ApolloError(
        TEAM_ERRORS.NOT_ALLOWED_TO_INVITE.MESSAGE,
        TEAM_ERRORS.NOT_ALLOWED_TO_INVITE.CODE,
      );
    }

    const membersIds = await this.getMembersIds(teamId);
    await this.CheckUsersIdsForExistingInTeam(membersIds, usersIds);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { usersIds, teamId } = ctx.getArgByIndex(1);
    await this.inviteCheck(usersIds, teamId, user.id);

    return true;
  }
}

@Injectable()
export class UpdateTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async updateAccessCheck(
    { teamId }: TeamUpdate,
    userId: number,
  ): Promise<Team> {
    const team = await this.teamService.getTeamById(teamId);

    if (userId !== team.ownerUser.id) {
      throw new ApolloError(
        TEAM_ERRORS.EDIT_ACCESS_RESTRICTED.MESSAGE,
        TEAM_ERRORS.EDIT_ACCESS_RESTRICTED.CODE,
      );
    }
    return team;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { updateTeamPayload } = ctx.getArgByIndex(1);

    const team = await this.updateAccessCheck(updateTeamPayload, user.id);

    ctx.getContext().req.team = team;

    return true;
  }
}

@Injectable()
export class DeleteTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async deleteAccessCheck(
    teamId: number,
    userId: number,
  ): Promise<void> {
    const team = await this.teamService.getTeamById(teamId);

    if (userId !== team.ownerUser.id) {
      throw new ApolloError(
        TEAM_ERRORS.DELETE_ACCESS_RESTRICTED.MESSAGE,
        TEAM_ERRORS.DELETE_ACCESS_RESTRICTED.CODE,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { teamId } = ctx.getArgByIndex(1);

    await this.deleteAccessCheck(teamId, user.id);

    return true;
  }
}

@Injectable()
export class EditTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async editAccessCheck(
    { teamId }: TeamUpdate,
    userId: number,
  ): Promise<void> {
    const team = await this.teamService.getTeamById(teamId);

    if (userId !== team.ownerUser.id) {
      throw new ApolloError(
        TEAM_ERRORS.EDIT_ACCESS_RESTRICTED.MESSAGE,
        TEAM_ERRORS.EDIT_ACCESS_RESTRICTED.CODE,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { editTeamPayload } = ctx.getArgByIndex(1);

    await this.editAccessCheck(editTeamPayload, user.id);

    return true;
  }
}

@Injectable()
export class JoinRequestTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async joinAccessCheck(teamId: number, userId: number): Promise<Team> {
    const team = await this.teamService.getTeamById(teamId);
    const isMemberAlreadyRequested = !!team.pendingUsers.find(
      ({ id }) => id === userId,
    );

    if (isMemberAlreadyRequested) {
      throw new ApolloError(
        TEAM_ERRORS.JOIN_REQUEST_RESTRICTED.MESSAGE,
        TEAM_ERRORS.JOIN_REQUEST_RESTRICTED.CODE,
      );
    }

    return team
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { teamId } = ctx.getArgByIndex(1);

    const team = await this.joinAccessCheck(teamId, user.id);

    ctx.getContext().req.team = team;

    return true;
  }
}

@Injectable()
export class DeleteJoinRequestTeamGuard
  extends JwtGuard
  implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async deleteJoinAccessCheck(
    teamId: number,
    userId: number,
  ): Promise<void> {
    const team = await this.teamService.getTeamById(teamId);
    const isMemberAlreadyRequested = !!team.pendingUsers.find(
      ({ id }) => id === userId,
    );

    const isOwnerUser = team.ownerUser.id === userId;

    if (!(isOwnerUser || isMemberAlreadyRequested)) {
      throw new ApolloError(
        TEAM_ERRORS.DELETE_REQUEST_RESTRICTED.MESSAGE,
        TEAM_ERRORS.DELETE_REQUEST_RESTRICTED.CODE,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { teamId } = ctx.getArgByIndex(1);

    await this.deleteJoinAccessCheck(teamId, user.id);

    return true;
  }
}

@Injectable()
export class AcceptInviteTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async AcceptAccessCheck(
    teamId: number,
    userId: number,
  ): Promise<void> {
    const team = await this.teamService.getTeamById(teamId);
    const shouldAccept = team.members.find(({ id }) => id === userId)
      ?.isAccepted;

    if (!shouldAccept) {
      throw new ApolloError(
        TEAM_ERRORS.ACCEPT_INVITE_RESTRICTED.MESSAGE,
        TEAM_ERRORS.ACCEPT_INVITE_RESTRICTED.CODE,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { teamId } = ctx.getArgByIndex(1);

    await this.AcceptAccessCheck(teamId, user.id);

    return true;
  }
}

@Injectable()
export class ApproveRequestTeamGuard extends JwtGuard implements CanActivate {
  constructor(
    private teamService: TeamService,
    private jwtService: JwtService,
  ) {
    super(jwtService);
  }

  private async getUsersIds(membersIds: number[]): Promise<number[]> {
    const users = await this.teamService.getMembers(membersIds);
    return users.map(({ user }) => user.id);
  }

  private async joinAccessCheck(teamId: number, userId: number): Promise<Team> {
    const team = await this.teamService.getTeamById(teamId);
    
    const isOwner = team.ownerUser.id === userId;

    const members = team.members.map(({id}) => id)

    const usersId = await this.getUsersIds(members);

    const isMember = !!usersId.find(
      (id) => id === userId,
    );

    if (!isOwner) {
      throw new ApolloError(
        TEAM_ERRORS.APPROVE_INVITE_RESTRICTED.MESSAGE,
        TEAM_ERRORS.APPROVE_INVITE_RESTRICTED.CODE,
      );
    }

    if (isMember) {
      throw new ApolloError(
        TEAM_ERRORS.USER_IS_ALREADY_MEMBER.MESSAGE,
        TEAM_ERRORS.USER_IS_ALREADY_MEMBER.CODE,
      );
    }

    return team
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ctx, user } = await this.authGuard(context);

    const { teamId } = ctx.getArgByIndex(1);

    const team = await this.joinAccessCheck(teamId, user.id);

    ctx.getContext().req.team = team;

    return true;
  }
}
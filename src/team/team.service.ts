import { Injectable } from '@nestjs/common';
import {
  getConnection,
  getRepository,
  Repository,
  Transaction,
  TransactionRepository,
} from 'typeorm';
import { Team, TeamMember } from './team.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from 'src/users/user.entity';
import {
  ImageProcessorService,
  ImageTargetType,
} from '../lib/image-processor/image-processor.service';
import { S3Service } from '../lib/s3/s3.service';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { TEAM_ERRORS } from './team.messages';
import { ApolloError } from 'apollo-server-express';
import {
  EditTeam,
  PaginatedTeams,
  TeamCreation,
  TeamUpdate,
} from './team.graphql';
import { ActivityServices } from 'src/activity/activity.service';
import { ActivityActionTypes } from 'src/activity/activity.types';
import { TeamType } from './team.types';
import { Activity } from 'src/activity/activity.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TeamService {
  constructor(
    private userServices: UsersService,
    private notificationsService: NotificationsService,
    private s3Service: S3Service,
    private imageProcessorService: ImageProcessorService,
    private activityServices: ActivityServices,
  ) {}

  async createTeam(
    currentUserId: number,
    team: TeamCreation,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<Team> {
    const repository = getRepository(Team);
    const {
      topics,
      name,
      description,
      invitedUsers,
      membersAllowedToHost,
      membersAllowedToInvite,
      teamType,
    } = team;
    const topicsCollection = topics.map((topicId) => ({ id: topicId }));
    const members = invitedUsers.map((id) => ({ user: { id } }));
    const savedTeam = await repository.save({
      name,
      description,
      topics: topicsCollection,
      ownerUser: {
        id: currentUserId,
      },
      members,
      membersAllowedToHost,
      membersAllowedToInvite,
      teamType,
    });

    await this.sendNotificationToInvitedPersons(
      savedTeam,
      invitedUsers,
      currentUserId,
    );

    await this.uploadFileTeam(
      currentUserId,
      savedTeam.id,
      avatar,
      backgroundImage,
    );

    return (await repository.findOne(savedTeam.id, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;
  }

  async uploadFileTeam(
    currentUserId: number,
    idTeam: number,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<Team> {
    const repository = getRepository(Team);
    const team = (await repository.findOne(idTeam, {
      relations: ['ownerUser'],
    })) as Team;

    if (!team) {
      throw new ApolloError(
        TEAM_ERRORS.TEAM_NOT_FOUND.MESSAGE,
        TEAM_ERRORS.TEAM_NOT_FOUND.CODE,
      );
    }

    if (team.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        TEAM_ERRORS.NOT_TEAM_OWNER.MESSAGE,
        TEAM_ERRORS.NOT_TEAM_OWNER.CODE,
      );
    }

    const removeAssets = [];

    if (avatar && team.avatar) {
      removeAssets.push(team.avatar);
    }

    if (backgroundImage && team.backgroundImage) {
      removeAssets.push(team.backgroundImage);
    }

    if (removeAssets.length) {
      await this.s3Service.removeFiles(removeAssets);
    }

    let avatarUpload;
    let backgroundImageUpload;

    if (avatar) {
      avatarUpload = this.imageProcessorService.optimizeImage(
        avatar.createReadStream(),
        ImageTargetType.AVATAR,
      );
    }

    if (backgroundImage) {
      backgroundImageUpload = this.imageProcessorService.optimizeImage(
        backgroundImage.createReadStream(),
        ImageTargetType.BACKGROUND_IMAGE,
      );
    }

    const [avatarResult, backgroundImageResult] = await Promise.all([
      avatarUpload
        ? this.s3Service.uploadFile({
            extension: avatarUpload.extension,
            mime: avatarUpload.mime,
            stream: avatarUpload.stream,
          })
        : undefined,
      backgroundImageUpload
        ? this.s3Service.uploadFile({
            extension: backgroundImageUpload.extension,
            mime: backgroundImageUpload.mime,
            stream: backgroundImageUpload.stream,
          })
        : undefined,
    ]);

    await repository.save({
      id: idTeam,
      avatar: avatarResult?.Key,
      backgroundImage: backgroundImageResult?.Key,
    });

    return (await repository.findOne(idTeam)) as Team;
  }

  async getUserInvites(userId: number): Promise<TeamMember[]> {
    const repository = getRepository(TeamMember);
    return await repository.find({
      relations: ['user', 'team'],
      where: { user: { id: userId } },
    });
  }

  async getTeamById(teamId: number): Promise<Team> {
    const repository = getRepository(Team);
    return (await repository.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;
  }

  async getMembers(membersIds: number[]): Promise<TeamMember[]> {
    const repository = getRepository(TeamMember);
    return await repository.findByIds(membersIds, { relations: ['user'] });
  }

  async getInvitedUser(id: number): Promise<User> {
    return getConnection()
      .createQueryBuilder()
      .relation(TeamMember, 'user')
      .of(id)
      .loadOne() as Promise<User>;
  }

  async getTargetTeam(id: number): Promise<Team> {
    return getConnection()
      .createQueryBuilder()
      .relation(TeamMember, 'team')
      .of(id)
      .loadOne() as Promise<Team>;
  }

  async inviteUsers(
    ids: number[],
    teamId: number,
    currentUser: number,
  ): Promise<Team> {
    const repo = getRepository(Team);
    const team = (await repo.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;
    const membersIds = ids.map((id) => ({ user: { id } }));

    const updatedTeam = await repo.save({
      id: teamId,
      members: [...team.members, ...membersIds],
    });

    await this.sendNotificationToInvitedPersons(team, ids, currentUser);

    return updatedTeam;
  }

  async sendNotificationWhenTeamTypeChanged(
    team: Team,
    updatedType: string,
    currentUser: number,
  ): Promise<void> {
    const ids = team.members.map(({ id }) => id);
    const users = await this.getMembers(ids);
    const usersIds = users.map(({ user }) => user.id);

    const activityNotificationAdditionalPayload = `from ${team.teamType} to ${updatedType}`;

    this.notificationsService.sendTeamUpdateStatusNotification(
      team,
      usersIds,
      updatedType,
    );

    await this.activityServices.sendGroupNotificationActivity(
      usersIds,
      team.id,
      currentUser,
      ActivityActionTypes.TEAM_STATUS_UPDATE,
      activityNotificationAdditionalPayload,
    );

    if (updatedType === TeamType.PUBLIC) {
      await this.cleanPendingUsers(team.id);
    }
  }

  async sendNotificationToInvitedPersons(
    team: Team,
    usersIds: number[],
    currentUser: number,
  ): Promise<void> {
    const user = await this.userServices.getUserProfile(currentUser);

    this.notificationsService.sendTeamInvitedMembersNotification(
      user,
      team.id,
      usersIds,
    );

    await this.activityServices.sendGroupNotificationActivity(
      usersIds,
      team.id,
      user.id,
      ActivityActionTypes.TEAM_INVITE,
      team.avatar as string | undefined,
    );
  }

  async sendOwnersApplyNotification(
    team: Team,
    currentUser: number,
  ): Promise<void> {
    const user = await this.userServices.getUserProfile(currentUser);

    this.notificationsService.sendOwnerApplicationNotification(team, user);

    const payload = {
      avatar: team.avatar,
      name: team.name,
    };

    await this.activityServices.sendGroupNotificationActivity(
      [team?.ownerUser.id],
      team.id,
      user.id,
      ActivityActionTypes.TEAM_JOIN_REQUEST,
      JSON.stringify(payload),
    );
  }

  async updateTeam(
    updatePayload: TeamUpdate,
    currentTeam: Team,
    currentUserId: number,
  ): Promise<Team> {
    const repository = getRepository(Team);
    const {
      teamId,
      membersAllowedToInvite,
      membersAllowedToHost,
      teamType,
    } = updatePayload;

    await repository.save({
      id: teamId,
      membersAllowedToInvite,
      membersAllowedToHost,
      teamType,
    });

    if (currentTeam.teamType !== teamType) {
      await this.sendNotificationWhenTeamTypeChanged(
        currentTeam,
        teamType,
        currentUserId,
      );
    }

    return (await repository.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;
  }

  @Transaction()
  async deleteTransactionHandler(
    teamId: number,
    type_action: string,
    @TransactionRepository(Team) teamRepository: Repository<Team>,
    @TransactionRepository(Activity) activityRepository: Repository<Activity>,
  ): Promise<void> {
    await activityRepository.delete({
      procedure_action: teamId,
      type_action,
    });

    const team = await teamRepository.delete(teamId);

    if (!team.affected) throw new Error();
  }

  async deleteTeam(teamId: number): Promise<Team> {
    const teamRepository = getRepository(Team);
    const activityRepository = getRepository(Activity);
    const team = teamRepository.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    });

    this.deleteTransactionHandler(
      teamId,
      'teamUpdate',
      teamRepository,
      activityRepository,
    );

    return team as Promise<Team>;
  }

  async editTeam(
    editTeam: EditTeam,
    currentUserId: number,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<Team> {
    const repository = getRepository(Team);
    const { topics, name, description, teamId, linkWebsite } = editTeam;
    const topicsCollection = topics.map((topicId) => ({ id: topicId }));
    const savedTeam = await repository.save({
      name,
      description,
      topics: topicsCollection,
      id: teamId,
      linkWebsite,
    });

    await this.uploadFileTeam(
      currentUserId,
      savedTeam.id,
      avatar,
      backgroundImage,
    );

    return (await repository.findOne(savedTeam.id, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;
  }

  async acceptInvite(userId: number, teamId: number): Promise<TeamMember> {
    const repo = getRepository(TeamMember);

    await repo.update(
      { user: { id: userId }, team: { id: teamId } },
      { isAccepted: true },
    );
    return (await repo.findOne(
      { user: { id: userId }, team: { id: teamId } },
      { relations: ['user', 'team'] },
    )) as TeamMember;
  }

  async leave(userId: number, teamId: number): Promise<TeamMember> {
    const repo = getRepository(TeamMember);

    await repo.update(
      { user: { id: userId }, team: { id: teamId } },
      { isAccepted: false },
    );
    return (await repo.findOne(
      { user: { id: userId }, team: { id: teamId } },
      { relations: ['user', 'team'] },
    )) as TeamMember;
  }

  async joinRequest(userId: number, team: Team): Promise<Team> {
    const repo = getRepository(Team);

    if (team.teamType !== TeamType.PUBLIC) {
      await this.sendOwnersApplyNotification(team, userId);
      return await repo.save({
        id: team.id,
        pendingUsers: [...team?.pendingUsers, { id: userId }],
      });
    }
    const newMember = {
      isAccepted: true,
      user: {
        id: userId,
      },
    };
    return await repo.save({
      id: team.id,
      members: [...team.members, newMember],
    });
  }

  async cleanPendingUsers(teamId: number): Promise<void> {
    const repo = getRepository(Team);

    const team = (await repo.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    })) as Team;

    const newMembers = team?.pendingUsers?.map(({ id }) => ({
      user: { id },
      isAccepted: true,
    }));

    await repo.save({
      id: teamId,
      pendingUsers: [],
      members: [...team?.members, ...newMembers],
    });
  }

  async deleteJoinRequest(userId: number, teamId: number): Promise<Team> {
    const repo = getRepository(Team);

    const team = await repo.findOne(teamId, {
      relations: ['participantUsers', 'ownerUser', 'members', 'pendingUsers'],
    });

    const pendingUsers = team?.pendingUsers.filter(({ id }) => id !== userId);

    return await repo.save({
      id: teamId,
      pendingUsers,
    });
  }

  async getTeams(paging: Paging, query: string): Promise<PaginatedTeams> {
    const teams = getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.topics', 'topics')
      .leftJoinAndSelect('team.ownerUser', 'ownerUser')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('team.pendingUsers', 'pendingUsers')
      .where('team.name ILIKE :name', { name: `%${query}%` })
      .andWhere('team.teamType != :teamType', { teamType: TeamType.SECRET })
      .orderBy('team.createdAt', 'DESC');

    const total = await teams.getCount();
    const preparedTeams = await teams
      .skip(paging.limit * (paging.page - 1))
      .take(paging.limit)
      .getMany();

    return {
      data: preparedTeams,
      paging: { page: paging.page, limit: paging.limit, total },
    };
  }

  async getUserTeams(
    paging: Paging,
    query: string,
    currentUser: number,
  ): Promise<PaginatedTeams> {
    const teams = getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.topics', 'topics')
      .leftJoinAndSelect('team.ownerUser', 'ownerUser')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('team.pendingUsers', 'pendingUsers')
      .where('team.name ILIKE :name', { name: `%${query}%` })
      .andWhere('ownerUser.id = :currentUser', { currentUser })
      .orWhere(
        'members.user.id = :currentUser AND members.isAccepted = :isAccepted',
        { currentUser, isAccepted: true },
      )
      .orderBy('team.createdAt', 'DESC');

    const total = await teams.getCount();
    const preparedTeams = await teams
      .skip(paging.limit * (paging.page - 1))
      .take(paging.limit)
      .getMany();

    return {
      data: preparedTeams,
      paging: { page: paging.page, limit: paging.limit, total },
    };
  }

  async getUserParticipatedTeams(
    paging: Paging,
    query: string,
    currentUser: number,
  ): Promise<PaginatedTeams> {
    const teams = getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.topics', 'topics')
      .leftJoinAndSelect('team.ownerUser', 'ownerUser')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('team.pendingUsers', 'pendingUsers')
      .where('team.name ILIKE :name', { name: `%${query}%` })
      .andWhere(
        'members.user.id = :currentUser AND members.isAccepted = :isAccepted',
        { currentUser, isAccepted: true },
      )
      .orderBy('team.createdAt', 'DESC');

    const total = await teams.getCount();
    const preparedTeams = await teams
      .skip(paging.limit * (paging.page - 1))
      .take(paging.limit)
      .getMany();

    return {
      data: preparedTeams,
      paging: { page: paging.page, limit: paging.limit, total },
    };
  }

  async approveJoinRequest(team: Team, applicantId: number): Promise<Team> {
    const repo = getRepository(Team);

    const pendingUsers = team.pendingUsers.filter(
      ({ id }) => id !== applicantId,
    );

    const incomingMember = { user: { id: applicantId }, isAccepted: true };

    return await repo.save({
      id: team.id,
      pendingUsers,
      members: [...team.members, incomingMember],
    });
  }
}

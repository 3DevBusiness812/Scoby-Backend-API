import { Injectable } from '@nestjs/common';
import { SessionJoinObject, SessionObject } from './sessions.graphql';
import { Session } from './session.entity';
import { getConnection, getRepository, In, IsNull, Not } from 'typeorm';
import { ApolloError } from 'apollo-server-express';
import { SESSIONS_ERRORS } from './sessions.messages';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/user.entity';
import { VonageService } from 'src/vonage/vonage.service';
import ms from 'ms';
import { USERS_ERRORS } from 'src/users/users.messages';
import { ActivityServices } from '../activity/activity.service';
import { boolean } from '@hapi/joi';
import { Paging } from 'src/lib/common/common.interfaces';
import { ActivityActionTypes } from 'src/activity/activity.types';

@Injectable()
export class SessionsService {
  constructor(
    private notificationsService: NotificationsService,
    private vonageService: VonageService,
    private activityServices: ActivityServices,
  ) {}

  async getUserSessions(id: number): Promise<SessionObject[]> {
    const sessions = await getConnection().query(
      `SELECT * FROM session where owner_user_id = ${id}`,
    );

    return sessions.map(async (item: Session) => ({
      ...item,
      ownerUser: await this.getSessionOwner(id),
      viewers: this.countViewers(item),
    }));
  }

  async createSession(
    currentUserId: number,
    topics: [number],
    title?: string | null,
    description?: string | null,
    invitedUsers?: [number] | null,
    isNotify?: boolean | null,
    secondScreenLink?: string | null,
    isPrivate?: boolean,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Session);
    const topicsCollection = topics.map((topicId) => ({ id: topicId }));
    const invitedUsersArray = invitedUsers
      ? invitedUsers.map((userId) => ({ id: userId }))
      : [];
    const savedSession = await repository.save({
      title,
      description,
      topics: topicsCollection,
      ownerUser: {
        id: currentUserId,
      },
      secondScreenLink,
      isPrivate, 
      invitedUsers: invitedUsersArray,
    });

    this.notificationsService.sendSessionCreatedNotifications(
      savedSession.id,
      isNotify,
      invitedUsers,
    );

    this.activityServices.sendGroupNotificationActivity(
      invitedUsers,
      savedSession.id,
      currentUserId,
      ActivityActionTypes.CREATE_SESSION,
    );
    const {
      vonageSessionToken,
      vonageUserToken,
    } = await this.vonageService.createSession(currentUserId, savedSession.id);

    await new Promise((resolve) => setTimeout(resolve, 800));
    const vonageApiToken = process.env.OPENTOK_API_KEY || '';
    const newSession = (await repository.findOne(savedSession.id, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;
    return {
      vonageSessionToken,
      vonageUserToken,
      token: vonageUserToken,
      vonageApiToken,
      session: { ...newSession, viewers: this.countViewers(newSession) },
    };
  }

  async updateSession(
    currentUserId: number,
    sessionId: number,
    description?: string | null,
  ): Promise<SessionObject> {
    const repository = getRepository(Session);
    const foundSession = await repository.findOne(sessionId, {
      relations: ['ownerUser'],
    });

    if (!foundSession) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (foundSession.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SESSIONS_ERRORS.NOT_SESSION_OWNER.MESSAGE,
        SESSIONS_ERRORS.NOT_SESSION_OWNER.CODE,
      );
    }

    await repository.save({
      id: sessionId,
      description,
    });

    const updatedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...updatedSession, viewers: this.countViewers(updatedSession) };
  }

  async getLiveSessions(
    currentUserId: number | undefined,
  ): Promise<SessionObject[]> {
    const repository = getRepository(Session);
    const whereCondition: { [key: string]: any } = {
      finishedAt: IsNull(),
    };

    if (currentUserId) {
      const result = (
        await getConnection()
          .createQueryBuilder()
          .relation(User, 'inappropriateUsers')
          .of(currentUserId)
          .loadMany()
      ).map((u) => u.id);

      if (result.length) {
        whereCondition.ownerUser = {
          id: Not(In(result)),
        };
      }
    }

    const liveSessions = repository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      relations: ['viewerUsers', 'greenRoomUsers'],
    });

    return (await liveSessions).map((session) => {
      return { ...session, viewers: this.countViewers(session) };
    });
  }

  async getLiveSessionsPaging(
    currentUserId: number | undefined,
    paging:Paging,
    notInclude:number[],
  ): Promise<SessionObject[]> {
    const repository = getRepository(Session);
    const whereCondition: { [key: string]: any } = {
      finishedAt: IsNull(),
      id:Not (In(notInclude)),
    };

    if (currentUserId) {
      const result = (
        await getConnection()
          .createQueryBuilder()
          .relation(User, 'inappropriateUsers')
          .of(currentUserId)
          .loadMany()
          
      ).map((u) => u.id);

      if (result.length) {
        whereCondition.ownerUser = {
          id: Not(In(result)),
        };
      }
    }

    const liveSessions =await  repository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      relations: ['viewerUsers', 'greenRoomUsers'],
      skip:paging.limit * (paging.page - 1),
      take:paging.limit,     
    });    
    
    return (await liveSessions).map((session) => {
      return { ...session, viewers: this.countViewers(session) };
    });
  }

  async getSessionById(sessionId: number): Promise<SessionObject> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers', 'invitedUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    return { ...session, viewers: this.countViewers(session) };
  }

  async joinSession(
    currentUserId: number,
    sessionId: number,
    userId: number,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Session);
    const userRepository = getRepository(User);
    const session = await repository.findOne(sessionId, {
      relations: [
        'ownerUser',
        'blockedUsers',
        'viewerUsers',
        'greenRoomUsers',
        'participantUsers',
        'invitedUsers'
      ],
    });

    const userToAdd = await userRepository.findOne(userId);

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!userToAdd) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.blockedUsers.find((u) => u.id === currentUserId)) {
      throw new ApolloError(
        SESSIONS_ERRORS.USER_BLOCKED.CODE,
        SESSIONS_ERRORS.USER_BLOCKED.MESSAGE,
      );
    }

    const { vonageSessionToken } = session;
    const vonageUserToken = await this.vonageService.joinSession(
      currentUserId,
      vonageSessionToken,
    );

    const vonageApiToken = process.env.OPENTOK_API_KEY || '';
    const token = vonageUserToken;

    const participantUsers = session.participantUsers || [];
    participantUsers.push(userToAdd as User);
    const viewerUsers = (session.viewerUsers || []).filter(
      (user) => user.id != userToAdd.id,
    );
    const greenRoomUsers = (session.greenRoomUsers || []).filter(
      (user) => user.id != userToAdd.id,
    );

    await repository.save({
      id: sessionId,
      participantUsers,
      viewerUsers,
      greenRoomUsers,
    });

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return {
      session: {
        ...savedSession,
        viewers: this.countViewers(savedSession),
      } as SessionObject,
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
    };
  }

  async joinGreenRoomSession(
    currentUserId: number,
    sessionId: number,
    userId: number,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Session);
    const userRepository = getRepository(User);
    const userToAdd = await userRepository.findOne(userId || currentUserId);
    const session = await repository.findOne(sessionId, {
      relations: [
        'ownerUser',
        'blockedUsers',
        'viewerUsers',
        'greenRoomUsers',
        'participantUsers',
      ],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!userToAdd) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.blockedUsers.find((u) => u.id === currentUserId)) {
      throw new ApolloError(
        SESSIONS_ERRORS.USER_BLOCKED.CODE,
        SESSIONS_ERRORS.USER_BLOCKED.MESSAGE,
      );
    }

    const { vonageSessionToken } = session;
    const vonageUserToken = await this.vonageService.joinSession(
      currentUserId,
      vonageSessionToken,
    );

    const vonageApiToken = process.env.OPENTOK_API_KEY || '';
    const token = vonageUserToken;
    const greenRoomUsers = session.greenRoomUsers || [];
    const viewerUsers = (session.viewerUsers || []).filter(
      (user) => user.id != userToAdd.id,
    );
    const participantUsers = (session.participantUsers || []).filter(
      (user) => user.id != userToAdd.id,
    );

    greenRoomUsers.push(userToAdd as User);

    await repository.save({
      id: sessionId,
      greenRoomUsers,
      viewerUsers,
      participantUsers,
    });

    const savedSession = await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    });

    if (!savedSession) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    return {
      session: { ...savedSession, viewers: this.countViewers(savedSession) },
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
    };
  }

  async viewSession(
    currentUserId: number,
    sessionId: number,
    userId: number,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Session);
    const userRepository = getRepository(User);
    const session = await repository.findOne(sessionId, {
      relations: [
        'blockedUsers',
        'viewerUsers',
        'greenRoomUsers',
        'participantUsers',
      ],
    });
    const userToAdd = await userRepository.findOne(userId || currentUserId);

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!userToAdd) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.blockedUsers.find((u) => u.id === currentUserId)) {
      throw new ApolloError(
        SESSIONS_ERRORS.USER_BLOCKED.CODE,
        SESSIONS_ERRORS.USER_BLOCKED.MESSAGE,
      );
    }

    const { vonageSessionToken } = session;
    const vonageUserToken = await this.vonageService.viewSession(
      currentUserId,
      vonageSessionToken,
    );
    const vonageApiToken = process.env.OPENTOK_API_KEY || '';
    const token = vonageUserToken;
    const viewerUsers = session.viewerUsers || [];
    viewerUsers.push(userToAdd);
    const participantUsers = session.participantUsers.filter(
      (user) => user.id != userToAdd.id,
    );
    const greenRoomUsers = session.greenRoomUsers.filter(
      (user) => user.id != userToAdd.id,
    );

    await repository.save({
      id: sessionId,
      viewerUsers,
      participantUsers,
      greenRoomUsers,
    });

    const savedSession = await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    });

    if (!savedSession) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    return {
      session: { ...savedSession, viewers: this.countViewers(savedSession) },
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
    };
  }

  shareSession(
    sessionId: number,
    invitedUsers: [number],
    notifyMyFollowers: boolean,
  ): boolean {
    this.notificationsService.sendSessionCreatedNotifications(
      sessionId,
      notifyMyFollowers,
      invitedUsers,
    );

    return true;
  }

  async endSession(
    currentUserId: number,
    sessionId: number,
  ): Promise<SessionObject> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['ownerUser'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (session.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SESSIONS_ERRORS.NOT_SESSION_OWNER.MESSAGE,
        SESSIONS_ERRORS.NOT_SESSION_OWNER.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    const finishedAt = new Date(Date.now() - ms('15m'));

    await repository.save({ id: sessionId, finishedAt });

    const savedSession = await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    });

    if (!savedSession) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async leaveSession(
    currentUserId: number,
    sessionId: number,
  ): Promise<SessionObject> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers', 'participantUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    const participantUsers = session.participantUsers.filter(
      (user) => user.id != currentUserId,
    );
    const viewerUsers = session.viewerUsers.filter(
      (user) => user.id != currentUserId,
    );
    const greenRoomUsers = session.greenRoomUsers.filter(
      (user) => user.id != currentUserId,
    );

    await repository.save({
      id: sessionId,
      participantUsers,
      viewerUsers,
      greenRoomUsers,
    });
    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(session) };
  }

  async kickUserFromSession(
    currentUserId: number,
    sessionId: number,
    userId: number,
  ): Promise<SessionObject> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId);

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (session.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SESSIONS_ERRORS.NOT_SESSION_OWNER.MESSAGE,
        SESSIONS_ERRORS.NOT_SESSION_OWNER.CODE,
      );
    }

    const participantUsers = (session.participantUsers || []).filter(
      (user) => user.id != userId,
    );
    const viewerUsers = (session.viewerUsers || []).filter(
      (user) => user.id != userId,
    );
    const greenRoomUsers = (session.greenRoomUsers || []).filter(
      (user) => user.id != userId,
    );

    await repository.save({
      id: sessionId,
      participantUsers,
      viewerUsers,
      greenRoomUsers,
    });
    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(session) };
  }

  async getSessionOwner(id: number): Promise<User> {
    return getConnection()
      .createQueryBuilder()
      .relation(Session, 'ownerUser')
      .of(id)
      .loadOne() as Promise<User>;
  }

  async getSessionParticipants(id: number): Promise<User[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Session, 'participantUsers')
      .of(id)
      .loadMany();
  }

  async getSessionGreenRoomUsers(id: number): Promise<User[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Session, 'greenRoomUsers')
      .of(id)
      .loadMany();
  }

  async getSessionViewers(id: number): Promise<User[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Session, 'viewerUsers')
      .of(id)
      .loadMany();
  }

  async handleUserJoined(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['participantUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.participantUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'participantUsers')
      .of(sessionId)
      .add(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleUserLeft(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['participantUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!session.participantUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'participantUsers')
      .of(sessionId)
      .remove(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleViewerJoined(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['viewerUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.viewerUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'viewerUsers')
      .of(sessionId)
      .add(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleViewerLeft(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['viewerUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!session.viewerUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'viewerUsers')
      .of(sessionId)
      .remove(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleGreenRoomUserJoined(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['greenRoomUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (session.finishedAt) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_FINISHED.MESSAGE,
        SESSIONS_ERRORS.SESSION_FINISHED.CODE,
      );
    }

    if (session.greenRoomUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'greenRoomUsers')
      .of(sessionId)
      .add(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleGreenRoomUserLeft(
    sessionId: number,
    userId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['greenRoomUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (!session.greenRoomUsers.find((u) => u.id === userId)) return;

    await getConnection()
      .createQueryBuilder()
      .relation(Session, 'greenRoomUsers')
      .of(sessionId)
      .remove(userId);

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleSessionClose(
    sessionId: number,
  ): Promise<SessionObject | undefined> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: ['participantUsers', 'greenRoomUsers', 'viewerUsers'],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    if (
      session.finishedAt &&
      !session.participantUsers.length &&
      !session.greenRoomUsers.length &&
      !session.viewerUsers.length
    ) {
      return;
    }

    await repository.save({
      id: sessionId,
      participantUsers: [],
      viewerUsers: [],
      finishedAt: session.finishedAt || new Date(),
    });

    const savedSession = (await repository.findOne(sessionId, {
      relations: ['viewerUsers', 'greenRoomUsers'],
    })) as Session;

    return { ...savedSession, viewers: this.countViewers(savedSession) };
  }

  async handleUserBlocked(sessionId: number, userId: number): Promise<void> {
    const repository = getRepository(Session);
    const session = await repository.findOne(sessionId, {
      relations: [
        'participantUsers',
        'greenRoomUsers',
        'viewerUsers',
        'blockedUsers',
      ],
    });

    if (!session) {
      throw new ApolloError(
        SESSIONS_ERRORS.SESSION_NOT_FOUND.MESSAGE,
        SESSIONS_ERRORS.SESSION_NOT_FOUND.CODE,
      );
    }

    const queries = [];

    if (session.participantUsers.find((u) => u.id === userId)) {
      queries.push(
        getConnection()
          .createQueryBuilder()
          .relation(Session, 'participantUsers')
          .of(sessionId)
          .remove(userId),
      );
    }

    if (session.participantUsers.find((u) => u.id === userId)) {
      queries.push(
        getConnection()
          .createQueryBuilder()
          .relation(Session, 'greenRoomUsers')
          .of(sessionId)
          .remove(userId),
      );
    }

    if (session.viewerUsers.find((u) => u.id === userId)) {
      queries.push(
        getConnection()
          .createQueryBuilder()
          .relation(Session, 'viewerUsers')
          .of(sessionId)
          .remove(userId),
      );
    }

    if (!session.blockedUsers.find((u) => u.id === userId)) {
      queries.push(
        getConnection()
          .createQueryBuilder()
          .relation(Session, 'blockedUsers')
          .of(sessionId)
          .add(userId),
      );
    }

    await Promise.all(queries);
  }

  countViewers(session: Session): number {
    const viewerUsers = !!session.viewerUsers ? session.viewerUsers.length : 0;
    const greenRoomUsers = !!session.greenRoomUsers
      ? session.greenRoomUsers.length
      : 0;
    return viewerUsers + greenRoomUsers;
  }
}

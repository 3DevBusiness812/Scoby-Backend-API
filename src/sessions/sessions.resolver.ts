import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { SessionsService } from './sessions.service';
import { SessionJoinObject, SessionObject } from './sessions.graphql';
import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { JwtGuard, OptionalJwtGuard } from '../lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';
import { PubSub } from 'graphql-subscriptions';
import { MqService } from '../lib/mq/mq.service';
import { MqMessageType } from './sessions.constants';
import { UserProfile } from '../users/users.graphql';
import { PrivateSessionGuard } from './privateSessionGuard.guard';
import { PagingInput } from '../lib/common/common.graphql';
import { Paging } from '../lib/common/common.interfaces';

@Resolver(() => SessionObject)
@UseGuards(OptionalJwtGuard)
export class SessionsResolver implements OnModuleInit {
  private readonly logger = new Logger(SessionsResolver.name);

  constructor(
    private sessionsService: SessionsService,
    private pubSub: PubSub,
    private mqService: MqService,
  ) {}

  onModuleInit(): void {
    this.mqService.subscribe(
      this.mqService.queues.apiSessionUsersQueue,
      this._userSessionQueueHandler,
    );
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async createSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('topics', { nullable: true, type: () => [Int] })
    topics: [number],
    @Args('title', { nullable: false, type: () => String })
    title?: null | string,
    @Args('description', { nullable: true, type: () => String })
    description?: null | string,
    @Args('invitedUsers', { nullable: true, type: () => [Int] })
    invitedUsers?: null | [number],
    @Args('notify', { nullable: true, type: () => Boolean })
    isNotify?: null | boolean,
    @Args('secondScreenLink', { nullable: true, type: () => String })
    secondScreenLink?: null | string,
    @Args('isPrivate', { nullable: true, type: () => Boolean })
    isPrivate?: boolean,
  ): Promise<SessionJoinObject> {
    const createdSession = await this.sessionsService.createSession(
      currentUser.id,
      topics,
      title,
      description,
      invitedUsers,
      isNotify,
      secondScreenLink,
      isPrivate,
    );

    await this.pubSub.publish('sessionCreated', {
      sessionCreated: createdSession.session,
    });

    return createdSession;
  }

  @Subscription(() => SessionObject)
  sessionCreated(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionCreated');
  }

  @Mutation(() => SessionObject)
  @UseGuards(JwtGuard)
  async updateSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('id', { type: () => Int }) id: number,
    @Args('description', { nullable: true, type: () => String })
    description?: null | string,
  ): Promise<SessionObject> {
    const updatedSession = await this.sessionsService.updateSession(
      currentUser.id,
      id,
      description,
    );

    await this.pubSub.publish('sessionUpdated', {
      sessionUpdated: updatedSession,
    });

    return updatedSession;
  }

  @Subscription(() => SessionObject)
  sessionUpdated(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionUpdated');
  }

  @Query(() => [SessionObject])
  @UseGuards(JwtGuard)
  async getLiveSessions(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<SessionObject[]> {
    return this.sessionsService.getLiveSessions(currentUser?.id);
  }

  @Query(() => SessionObject)
  @UseGuards(JwtGuard)
  async getSession(@Args('id') sessionId: number): Promise<SessionObject> {
    return this.sessionsService.getSessionById(sessionId);
  }

  @Query(() => [SessionObject])
  @UseGuards(JwtGuard)
  async getUserSessions(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<SessionObject[]> {
    return this.sessionsService.getUserSessions(currentUser.id);
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async joinSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') sessionId: number,
    @Args('userId', { nullable: true }) userId: number,
  ): Promise<SessionJoinObject> {
    const sessionUpdated = await this.sessionsService.joinSession(
      currentUser.id,
      sessionId,
      userId,
    );

    await this.pubSub.publish('sessionUpdated', { sessionUpdated });

    return sessionUpdated;
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async joinGreenRoomSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') sessionId: number,
    @Args('userId', { nullable: true }) userId: number,
  ): Promise<SessionJoinObject> {
    const sessionUpdated = this.sessionsService.joinGreenRoomSession(
      currentUser.id,
      sessionId,
      userId,
    );

    await this.pubSub.publish('sessionUpdated', { sessionUpdated });

    return sessionUpdated;
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async viewSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') id: number,
    @Args('userId', { nullable: true }) userId: number,
  ): Promise<SessionJoinObject> {
    const sessionUpdated = this.sessionsService.viewSession(
      currentUser.id,
      id,
      userId,
    );

    await this.pubSub.publish('sessionUpdated', { sessionUpdated });

    return sessionUpdated;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtGuard)
  shareSession(
    @Args('sessionId') sessionId: number,
    @Args('invitedUsers', { nullable: true, type: () => [Int] })
    invitedUsers: [number],
    @Args('notifyMyFollowers') notifyMyFollowers: boolean,
  ): boolean {
    return this.sessionsService.shareSession(
      sessionId,
      invitedUsers,
      notifyMyFollowers,
    );
  }

  @Mutation(() => SessionObject)
  @UseGuards(JwtGuard)
  async endSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('sessionId') sessionId: number,
  ): Promise<SessionObject> {
    return await this.sessionsService.endSession(currentUser.id, sessionId);
  }

  @Mutation(() => SessionObject)
  @UseGuards(JwtGuard)
  async leaveSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('sessionId') sessionId: number,
  ): Promise<SessionObject> {
    return await this.sessionsService.leaveSession(currentUser.id, sessionId);
  }

  @Mutation(() => SessionObject)
  @UseGuards(JwtGuard)
  async kickUserFromSession(
    @CurrentUser() currentUser: BasePayload,
    @Args('sessionId') sessionId: number,
    @Args('userId') userId: number,
  ): Promise<SessionObject> {
    return await this.sessionsService.kickUserFromSession(
      currentUser.id,
      sessionId,
      userId,
    );
  }

  @Query(() => [SessionObject])
  @UseGuards(JwtGuard)
  async getLiveSessionsPaging(
    @CurrentUser() currentUser: BasePayload,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<SessionObject[]> {
    return this.sessionsService.getLiveSessionsPaging(currentUser?.id,paging,[0]);
  }

  @ResolveField('ownerUser', () => UserProfile)
  async ownerUser(
    @Parent() sessionObject: SessionObject,
  ): Promise<UserProfile> {
    return this.sessionsService.getSessionOwner(sessionObject.id);
  }

  @ResolveField('participantUsers', () => [UserProfile])
  async participantUsers(
    @Parent() sessionObject: SessionObject,
  ): Promise<UserProfile[]> {
    return this.sessionsService.getSessionParticipants(sessionObject.id);
  }

  @ResolveField('greenRoomUsers', () => [UserProfile])
  async greenRoomUsers(
    @Parent() sessionObject: SessionObject,
  ): Promise<UserProfile[]> {
    return this.sessionsService.getSessionGreenRoomUsers(sessionObject.id);
  }

  @ResolveField('viewerUsers', () => [UserProfile])
  async viewerUsers(
    @Parent() sessionObject: SessionObject,
  ): Promise<UserProfile[]> {
    return this.sessionsService.getSessionViewers(sessionObject.id);
  }

  @Subscription(() => SessionObject)
  sessionUserJoined(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionUserJoined');
  }

  @Subscription(() => SessionObject)
  sessionUserLeft(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionUserLeft');
  }

  @Subscription(() => SessionObject)
  sessionViewerJoined(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionViewerJoined');
  }

  @Subscription(() => SessionObject)
  sessionViewerLeft(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionViewerLeft');
  }

  @Subscription(() => SessionObject)
  sessionClosed(): AsyncIterator<SessionObject> {
    return this.pubSub.asyncIterator<SessionObject>('sessionClosed');
  }

  private _userSessionQueueHandler = async (message: {
    [key: string]: any;
  }): Promise<void> => {
    try {
      switch (message.type) {
        case MqMessageType.USER_JOINED: {
          const update = await this.sessionsService.handleUserJoined(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionUserJoined', {
              sessionUserJoined: update,
            });
          }
          break;
        }
        case MqMessageType.USER_LEFT: {
          const update = await this.sessionsService.handleUserLeft(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionUserLeft', {
              sessionUserLeft: update,
            });
          }
          break;
        }
        case MqMessageType.VIEWER_JOINED: {
          const update = await this.sessionsService.handleViewerJoined(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionViewerJoined', {
              sessionViewerJoined: update,
            });
          }
          break;
        }
        case MqMessageType.VIEWER_LEFT: {
          const update = await this.sessionsService.handleViewerLeft(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionViewerLeft', {
              sessionViewerLeft: update,
            });
          }
          break;
        }
        case MqMessageType.GREEN_ROOM_USER_JOINED: {
          const update = await this.sessionsService.handleGreenRoomUserJoined(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionGreenRoomUserJoined', {
              sessionViewerJoined: update,
            });
          }
          break;
        }
        case MqMessageType.GREEN_ROOM_USER_LEFT: {
          const update = await this.sessionsService.handleGreenRoomUserLeft(
            message.sessionId,
            message.userId,
          );
          if (update) {
            await this.pubSub.publish('sessionGreenRoomUserLeft', {
              sessionViewerLeft: update,
            });
          }
          break;
        }
        case MqMessageType.SESSION_CLOSED: {
          const update = await this.sessionsService.handleSessionClose(
            message.sessionId,
          );
          if (update) {
            await this.pubSub.publish('sessionClosed', {
              sessionClosed: update,
            });
          }
          break;
        }
        case MqMessageType.USER_BLOCKED: {
          await this.sessionsService.handleUserBlocked(
            message.sessionId,
            message.userId,
          );
          break;
        }
      }
    } catch (e) {
      this.logger.error('Failed to process message', JSON.stringify(message));
    }
  };
}

import { Logger, Injectable } from '@nestjs/common';
import { PushTokensService } from '../push-tokens/push-tokens.service';
import { getRepository, In } from 'typeorm';
import { FirebaseService } from '../lib/firebase/firebase.service';
import { notificationsParamsMessages } from './notifications.messages';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { Series } from 'src/series/series.entity';
import { Team } from 'src/team/team.entity';
import { UserProfile } from 'src/users/users.graphql';
import { Event } from 'src/events/events.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private pushTokensService: PushTokensService,
    private firebaseService: FirebaseService,
  ) {}

  sendSessionCreatedNotifications(
    sessionId: number,
    isNotify?: boolean | null,
    invitedUsers?: [number] | null,
  ): void {
    setImmediate(async () => {
      try {
        const session = await getRepository(Session).findOne(sessionId, {
          relations: ['ownerUser'],
        });
        if (!session) throw new Error('Session not found');

        const owner = session.ownerUser;

        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];

        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userStartedSession(
                session,
                owner,
                pushToken.user,
              ),
            })),
          );

          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }

  async newMessageNotification(
    receiverId: number,
    senderId: number,
    messageText: string,
  ): Promise<void> {
    try {
      const repo = getRepository(User);
      const sender = await repo.findOne(senderId);

      if (!sender) throw new Error('Sender not found');

      const generator = this.pushTokensService.pushTokensGenerator(
        {
          user: {
            id: receiverId,
          },
        },
        true,
      );

      for await (const pushTokens of generator) {
        const notifications = await Promise.all(
          pushTokens.map(async (pushToken) => ({
            token: pushToken.token,
            data: { senderId },
            notification: notificationsParamsMessages.newChatMessage(
              sender,
              messageText,
            ),
          })),
        );

        await this.firebaseService.sendAllNotifications(notifications);
      }
    } catch (e) {
      console.log('New message notification error');
    }
  }

  sendFollowUserNotification(sourceId: number, targetId: number): void {
    setImmediate(async () => {
      try {
        const owner = await getRepository(User).findOne(sourceId);
        if (!owner) throw new Error('User not found');

        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: targetId,
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          await Promise.all(
            pushTokens.map(async (pushToken) =>
              this.firebaseService.sendNotification(
                pushToken.token,
                notificationsParamsMessages.userStartedFollow(
                  owner,
                  pushToken.user,
                ),
              ),
            ),
          );
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }

  sendSeriesCreatedNotifications(
    serieId: number,
    sourceUser: number,
    invitedUsers?: [number] | null,
  ): void {
    setImmediate(async () => {
      try {
        const serie = await getRepository(Series).findOne(serieId);
        if (!serie) throw new Error('Serie not found');

        const user = await getRepository(User).findOne(sourceUser);
        if (!user) throw new Error('User not found');

        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];

        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userStartedSerie(
                serie,
                user,
                pushToken.user,
              ),
            })),
          );
          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  sendTeamCreatedNotification(
    teamId: number,
    invitedUsers: number[] | null,
  ): void {
    setImmediate(async () => {
      try {
        const team = await getRepository(Team).findOne(teamId, {
          relations: ['ownerUser'],
        });
        if (!team) throw new Error('Team not found');

        const owner = team.ownerUser;
        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];
        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userStartedTeam(
                team,
                owner,
                pushToken.user,
              ),
            })),
          );

          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  sendTeamInvitedMembersNotification(
    sender: UserProfile,
    teamId: number,
    invitedUsers: number[] | null,
  ): void {
    setImmediate(async () => {
      try {
        const team = await getRepository(Team).findOne(teamId, {
          relations: ['ownerUser'],
        });
        if (!team) throw new Error('Team not found');

        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];
        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userStartedTeam(
                team,
                sender,
                pushToken.user,
              ),
            })),
          );

          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  sendTeamUpdateStatusNotification(
    team: Team,
    invitedUsers: number[] | null,
    updatedTeamType: string,
  ): void {
    setImmediate(async () => {
      try {
        if (!team) throw new Error('Team not found');

        const owner = team.ownerUser;
        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];
        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userUpdateTeamType(
                team,
                owner,
                pushToken.user,
                updatedTeamType,
              ),
            })),
          );

          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  sendOwnerApplicationNotification(
    team: Team,
    requester: User | UserProfile,
  ): void {
    setImmediate(async () => {
      try {
        if (!team) throw new Error('Team not found');

        const owner = team.ownerUser;
        
        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In([owner.id]),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.ownerApplication(
                team,
                requester,
                pushToken.user,
              ),
            })),
          );

          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  sendEventCreatedNotifications(
    eventId: number,
    sourceUser: number,
    invitedUsers?: [number] | null,
  ): void {
    setImmediate(async () => {
      try {
        const event = await getRepository(Event).findOne(eventId);
        if (!event) throw new Error('Event not found');

        const user = await getRepository(User).findOne(sourceUser);
        if (!user) throw new Error('User not found');

        const usersForNotifications =
          invitedUsers && invitedUsers.length > 0 ? [...invitedUsers] : [];

        const generator = this.pushTokensService.pushTokensGenerator(
          {
            user: {
              id: In(usersForNotifications),
            },
          },
          true,
        );

        for await (const pushTokens of generator) {
          const notifications = await Promise.all(
            pushTokens.map(async (pushToken) => ({
              token: pushToken.token,
              notification: notificationsParamsMessages.userStartedEvent(
                event,
                user,
                pushToken.user,
              ),
            })),
          );
          await this.firebaseService.sendAllNotifications(notifications);
        }
      } catch (e) {
        this.logger.error('Failed to send notifications', e);
      }
    });
  }
  
}

import { Injectable } from '@nestjs/common';
import { getConnection, getRepository } from 'typeorm';
import { EventCreation, EventsObject, EventUpdate } from './events.graphql';
import { Event } from './events.entity';
import { ActivityServices } from '../activity/activity.service';
import { ActivityActionTypes } from 'src/activity/activity.types';
import { FileUpload } from '../lib/common/common.interfaces';
import { S3Service } from '../lib/s3/s3.service';
import { EVENT_ERRORS } from './event.messages';
import { USERS_ERRORS } from 'src/users/users.messages';
import { ApolloError } from 'apollo-server-express';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ImageProcessorService,
  ImageTargetType,
} from '../lib/image-processor/image-processor.service';
import { User } from 'src/users/user.entity';
import { SessionsService } from 'src/sessions/sessions.service';
import { Session } from 'src/sessions/session.entity';
import { SessionJoinObject } from 'src/sessions/sessions.graphql';
import { Topic } from '../topics/topic.entity';
@Injectable()
export class EventsService {
  constructor(
    private activityServices: ActivityServices,
    private s3Service: S3Service,
    private imageProcessorService: ImageProcessorService,
    private notificationsService: NotificationsService,
    private sessionsService: SessionsService,
  ) {}

  async createEvent(
    currentUserId: number,
    event: EventCreation,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const { title, description, day, start, end } = event;
    const topicsCollection = event.topics.map((topicId) => ({ id: topicId }));
    const savedEvent = await repository.save({
      title,
      description,
      day,
      start,
      end,
      topics: topicsCollection,
      ownerUser: {
        id: currentUserId,
      },
    });

    this.activityServices.sendGroupNotificationActivity(
      event.invitedUsers,
      savedEvent.id,
      currentUserId,
      ActivityActionTypes.CREATE_EVENT,
    );

    this.notificationsService.sendEventCreatedNotifications(
      savedEvent.id,
      currentUserId,
      event.invitedUsers,
    );

    await this.uploadFileEvent(
      currentUserId,
      savedEvent.id,
      avatar,
      backgroundImage,
    );

    return (await repository.findOne(savedEvent.id, {
      relations: ['ownerUser'],
    })) as Event;
  }

  async uploadFileEvent(
    currentUserId: number,
    idEvent: number,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const event = (await repository.findOne(idEvent, {
      relations: ['ownerUser'],
    })) as Event;

    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    if (event.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        EVENT_ERRORS.NOT_EVENT_OWNER.MESSAGE,
        EVENT_ERRORS.NOT_EVENT_OWNER.CODE,
      );
    }

    const removeAssets = [];

    if (avatar && event.avatar) {
      removeAssets.push(event.avatar);
    }

    if (backgroundImage && event.backgroundImage) {
      removeAssets.push(event.backgroundImage);
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
      id: idEvent,
      avatar: avatarResult?.Key,
      backgroundImage: backgroundImageResult?.Key,
    });

    return (await repository.findOne(idEvent)) as Event;
  }

  async getUserEvents(
    ownerId: number,
    userId?: number,
  ): Promise<EventsObject[]> {
    const id = userId ? userId : ownerId;
    return await getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.session', 'session')
      .where('event.ownerUser = :id', { id })
      .andWhere('event.finishedAt is null')
      .orderBy('event.createdAt', 'DESC')
      .getMany();
  }

  async invitedUsersEvent(
    currentUserId: number,
    invitedUsers: [number],
    idEvent: number,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const event = (await repository.findOne(idEvent, {
      relations: ['ownerUser'],
    })) as Event;

    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    this.activityServices.sendGroupNotificationActivity(
      invitedUsers,
      event.id,
      currentUserId,
      ActivityActionTypes.CREATE_EVENT,
    );

    this.notificationsService.sendEventCreatedNotifications(
      event.id,
      currentUserId,
      invitedUsers,
    );

    return event;
  }

  async joinEvent(
    currentUserId: number,
    idEvent: number,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const userRepository = getRepository(User);
    const event = await repository.findOne(idEvent, {
      relations: ['ownerUser', 'suscribeUsers'],
    });
    const userToAdd = await userRepository.findOne(currentUserId);

    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    if (!userToAdd) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (event.finishedAt) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_FINISHED.MESSAGE,
        EVENT_ERRORS.EVENT_FINISHED.CODE,
      );
    }

    const suscribeUsers = event.suscribeUsers || [];
    suscribeUsers.push(userToAdd as User);

    await repository.save({ id: idEvent, suscribeUsers });
    return (await repository.findOne(idEvent, {
      relations: ['ownerUser'],
    })) as Event;
  }

  async leaveEvent(
    currentUserId: number,
    idEvent: number,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const event = await repository.findOne(idEvent, {
      relations: ['ownerUser', 'suscribeUsers'],
    });
    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }
    const suscribeUsers = event.suscribeUsers.filter(
      (user) => user.id !== currentUserId,
    );
    await repository.save({ id: idEvent, suscribeUsers });

    return (await repository.findOne(idEvent)) as Event;
  }

  async liveEvent(
    currentUser: number,
    idEvent: number,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Event);
    const event = await repository.findOne(idEvent, {
      relations: ['ownerUser', 'suscribeUsers', 'session'],
    });
    const sessionRepository = getRepository(Session);

    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    if (event.ownerUser.id !== currentUser) {
      throw new ApolloError(
        EVENT_ERRORS.NOT_EVENT_OWNER.MESSAGE,
        EVENT_ERRORS.NOT_EVENT_OWNER.CODE,
      );
    }

    if (event.session && !event.session.finishedAt) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_IS_LIVE.MESSAGE,
        EVENT_ERRORS.EVENT_IS_LIVE.CODE,
      );
    }

    const topics = event.topics.map((topicId) => topicId.id);
    const {
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
      session,
    } = await this.sessionsService.createSession(
      currentUser,
      [topics[0]],
      event.title,
      event.description,
    );

    const sessionSave = (await sessionRepository.findOne(
      session.id,
    )) as Session;

    await repository.save({
      id: idEvent,
      session: sessionSave,
    });

    return {
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
      session: {
        ...sessionSave,
        viewers: this.sessionsService.countViewers(sessionSave),
      },
    };
  }

  async getEventById(id: number): Promise<EventsObject> {
    const repository = getRepository(Event);
    const event = (await repository.findOne(id, {
      relations: ['session'],
    })) as Event;

    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }
    return event;
  }

  async editEvent(
    currentUserId: number,
    idEvent: number,
    event: EventUpdate,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const eventRepository = await repository.findOne(idEvent, {
      relations: ['ownerUser'],
    });
    if (!eventRepository) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    if (eventRepository.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        EVENT_ERRORS.NOT_EVENT_OWNER.MESSAGE,
        EVENT_ERRORS.NOT_EVENT_OWNER.CODE,
      );
    }

    if (eventRepository.finishedAt) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_FINISHED.MESSAGE,
        EVENT_ERRORS.EVENT_FINISHED.CODE,
      );
    }
    await this.uploadFileEvent(
      currentUserId,
      eventRepository.id,
      avatar,
      backgroundImage,
    );

    const topicsCollection = event.topics.map((topicId) => ({ id: topicId }));
    return await repository.save({
      id: idEvent,
      title: event.title,
      description: event.description,
      day: event.day || eventRepository.day,
      start: event.start || eventRepository.start,
      end: event.end || eventRepository.end,
      topics: topicsCollection,
    });
  }

  async endEvent(
    currentUserId: number,
    idEvent: number,
  ): Promise<EventsObject> {
    const repository = getRepository(Event);
    const event = await repository.findOne(idEvent, {
      relations: ['ownerUser', 'session'],
    });
    if (!event) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_NOT_FOUND.MESSAGE,
        EVENT_ERRORS.EVENT_NOT_FOUND.CODE,
      );
    }

    if (event.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        EVENT_ERRORS.NOT_EVENT_OWNER.MESSAGE,
        EVENT_ERRORS.NOT_EVENT_OWNER.CODE,
      );
    }

    if (event.finishedAt) {
      throw new ApolloError(
        EVENT_ERRORS.EVENT_FINISHED.MESSAGE,
        EVENT_ERRORS.EVENT_FINISHED.CODE,
      );
    }

    if (event.session) {
      this.sessionsService.endSession(currentUserId, event.session.id);
    }
    const finishedAt = new Date(Date.now());
    return await repository.save({ id: idEvent, finishedAt });
  }

  async getLiveEvents(): Promise<EventsObject[]> {
    return await getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.session', 'session')
      .where('event.finishedAt is null')
      .andWhere('event.session is not null')
      .andWhere('session.finishedAt is null')
      .orderBy('event.createdAt', 'DESC')
      .getMany();
  }

  async getEventsPaging(
    limit: number,
    page:number,
  ): Promise<EventsObject[]> {
    await this.endEvents();
    return await getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.session', 'session')
      .leftJoinAndSelect('event.suscribeUsers', 'suscribeUsers')
      .where('event.finishedAt is null')
      .andWhere(
        'session.finishedAt is not null OR event.session is null AND event.finishedAt is null',
      )
      .skip(limit * (page - 1))
      .take(limit)
      .orderBy('event.day', 'ASC')
      .getMany();
  }

  async endEvents(): Promise<void> {
    const repository = getRepository(Event);
    const events = await getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.session', 'session')
      .where('event.finishedAt is null')
      .andWhere('event.session is not null AND session.finishedAt is not null')
      .getMany();

      events.map((event) => {
      repository.save({
        id: event.id,
        session: null,
      });
    });
  }

  async getLiveEventsPaging(
    limit: number,
    page:number,
  ): Promise<EventsObject[]> {    
    return await getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.session', 'session')
      .leftJoinAndSelect('event.ownerUser', 'ownerUser')
      .where('event.finishedAt is null')
      .andWhere('event.session is not null')
      .andWhere('session.finishedAt is null')
      .orderBy('event.day', 'ASC')
      .skip(limit * (page - 1))
      .take(limit)
      .getMany();
  }

  async getsuscribeUsers(id: number): Promise<User[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Event, 'suscribeUsers')
      .of(id)
      .loadMany();
  }

  async getUserTopics(idEvent: number): Promise<Topic[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Event, 'topics')
      .of(idEvent)
      .loadMany();
  }

  async getEventOwner(id: number): Promise<User> {
    return getConnection()
      .createQueryBuilder()
      .relation(Event, 'ownerUser')
      .of(id)
      .loadOne() as Promise<User>;
  }

  async getViewers(idEvent: number): Promise<number> {
    const repository = getRepository(Event);
    const repositorySession = getRepository(Session);
    const event = await repository.findOne(idEvent, { relations: ['session'] });
    const session =
      event && event.session
        ? await repositorySession.findOne(event.session.id, {
            relations: ['viewerUsers', 'greenRoomUsers'],
          })
        : 0;
    return session ? this.sessionsService.countViewers(session) : 0;
  }

  async subscribed(idEvent: number, currentUserId: number): Promise<boolean> {
    const repository = getRepository(Event);
    const { suscribeUsers } = (await repository.findOne(idEvent, {
      relations: ['suscribeUsers'],
    })) as Event;
    return [...suscribeUsers].some((User) => User.id === currentUserId);
  }
}

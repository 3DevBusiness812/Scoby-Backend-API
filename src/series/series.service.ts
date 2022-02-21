import { Injectable } from '@nestjs/common';
import { getConnection, getRepository } from 'typeorm';
import { Series } from './series.entity';
import { Session } from '../sessions/session.entity';
import { ActivityServices } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SessionsService } from 'src/sessions/sessions.service';
import {
  SeriesObject,
  SerieCreation,
  serieEdit,
  ScheduleCreation,
  SeriesViewers,
} from './series.graphql';
import { FileUpload } from '../lib/common/common.interfaces';
import { S3Service } from '../lib/s3/s3.service';
import { SERIES_ERRORS } from './series.messages';
import { USERS_ERRORS } from 'src/users/users.messages';
import { ApolloError } from 'apollo-server-express';
import { KartraService } from '../lib/kartra/kartra.service';
import { SessionJoinObject } from '../sessions/sessions.graphql';
import {
  ImageProcessorService,
  ImageTargetType,
} from '../lib/image-processor/image-processor.service';
import { User } from 'src/users/user.entity';
import { Schedule } from './series-schedule.entity';
import { Topic } from '../topics/topic.entity';
import { ActivityActionTypes } from 'src/activity/activity.types';

@Injectable()
export class SeriesServices {
  constructor(
    private notificationsService: NotificationsService,
    private s3Service: S3Service,
    private imageProcessorService: ImageProcessorService,
    private activityServices: ActivityServices,
    private kartraService: KartraService,
    private sessionsService: SessionsService,
  ) {}

  async createSerie(
    currentUserId: number,
    serie: SerieCreation,
    schedules: [ScheduleCreation],
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<SeriesObject> {
    const repository = getRepository(Series);
    let { calendarName, className } = serie;
    const { seriesName, description, topics, invitedUsers } = serie;

    calendarName = calendarName == null ? '' : calendarName;
    className = className == null ? '' : className;
    const topicsCollection = topics.map((topicId) => ({ id: topicId }));
    const savedSeries = await repository.save({
      calendarName,
      className,
      seriesName,
      topics: topicsCollection,
      description,
      ownerUser: {
        id: currentUserId,
      },
    });
    const repositorySchedule = getRepository(Schedule);
    for await (const schedule of schedules) {
      await repositorySchedule.save({
        day: schedule.day,
        startSerie: schedule.start,
        endSerie: schedule.end,
        serie: savedSeries,
      });
    }

    this.notificationsService.sendSeriesCreatedNotifications(
      savedSeries.id,
      currentUserId,
      invitedUsers,
    );

    this.activityServices.sendGroupNotificationActivity(
      invitedUsers,
      savedSeries.id,
      currentUserId,
      ActivityActionTypes.CREATE_SERIE,
    );

    await this.uploadFileSeries(
      currentUserId,
      savedSeries.id,
      avatar,
      backgroundImage,
    );

    return (await repository.findOne(savedSeries.id, {
      relations: ['ownerUser', 'schedule'],
    })) as Series;
  }

  async uploadFileSeries(
    currentUserId: number,
    idSerie: number,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<SeriesObject> {
    const repository = getRepository(Series);
    const serie = (await repository.findOne(idSerie, {
      relations: ['ownerUser'],
    })) as Series;

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    if (serie.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SERIES_ERRORS.NOT_SERIE_OWNER.MESSAGE,
        SERIES_ERRORS.NOT_SERIE_OWNER.CODE,
      );
    }

    const removeAssets = [];

    if (avatar && serie.avatar) {
      removeAssets.push(serie.avatar);
    }

    if (backgroundImage && serie.backgroundImage) {
      removeAssets.push(serie.backgroundImage);
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
      id: idSerie,
      avatar: avatarResult?.Key,
      backgroundImage: backgroundImageResult?.Key,
    });

    return (await repository.findOne(idSerie)) as Series;
  }

  async invitedUsersSeries(
    currentUserId: number,
    invitedUsers: [number],
    idSerie: number,
  ): Promise<SeriesObject> {
    const repository = getRepository(Series);
    const serie = (await repository.findOne(idSerie, {
      relations: ['ownerUser'],
    })) as Series;

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    this.notificationsService.sendSeriesCreatedNotifications(
      serie.id,
      currentUserId,
      invitedUsers,
    );

    this.activityServices.sendGroupNotificationActivity(
      invitedUsers,
      serie.id,
      currentUserId,
      ActivityActionTypes.CREATE_SERIE,
    );

    return serie;
  }

  async getUserSeries(
    ownerId: number,
    userId?: number,
  ): Promise<SeriesObject[]> {
    const id = userId ? userId : ownerId;
    return await getRepository(Series)
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.session', 'session')
      .leftJoinAndSelect('series.schedule', 'schedule')
      .where('series.ownerUser = :id', { id })
      .andWhere('series.finishedAt is null')
      .orderBy('series.createdAt', 'DESC')
      .getMany();
  }

  async joinSerie(
    currentUserId: number,
    serieId: number,
  ): Promise<SeriesObject> {
    const repository = getRepository(Series);
    const userRepository = getRepository(User);
    const serie = await repository.findOne(serieId, {
      relations: ['ownerUser', 'suscribeUsers'],
    });
    const userToAdd = await userRepository.findOne(currentUserId);

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    if (!userToAdd) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    if (serie.finishedAt) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_FINISHED.MESSAGE,
        SERIES_ERRORS.SERIE_FINISHED.CODE,
      );
    }

    const suscribeUsers = serie.suscribeUsers || [];
    suscribeUsers.push(userToAdd as User);

    if (serie.className && serie.calendarName) {
      await this.kartraService.kartraSuscribeLeadCalendar(
        userToAdd.email || '',
        serie.calendarName,
        serie.className,
      );
    }

    await repository.save({ id: serieId, suscribeUsers });
    const savedSerie = (await repository.findOne(serieId, {
      relations: ['ownerUser', 'schedule'],
    })) as Series;

    return savedSerie;
  }

  async endSerie(currentUserId: number, serieId: number): Promise<Series> {
    const repository = getRepository(Series);
    const serie = await repository.findOne(serieId, {
      relations: ['ownerUser', 'suscribeUsers', 'session'],
    });

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    if (serie.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SERIES_ERRORS.NOT_SERIE_OWNER.MESSAGE,
        SERIES_ERRORS.NOT_SERIE_OWNER.CODE,
      );
    }

    if (serie.finishedAt) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_FINISHED.MESSAGE,
        SERIES_ERRORS.SERIE_FINISHED.CODE,
      );
    }

    if (serie.session) {
      this.sessionsService.endSession(currentUserId, serie.session.id);
    }

    const finishedAt = new Date(Date.now());
    await repository.save({ id: serieId, finishedAt });
    const savedSerie = await repository.findOne(serieId, {
      relations: ['ownerUser', 'schedule'],
    });

    if (!savedSerie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    return savedSerie;
  }

  async editSerie(
    currentUserId: number,
    serieId: number,
    schedules: [ScheduleCreation],
    serie: serieEdit,
    avatar?: FileUpload,
    backgroundImage?: FileUpload,
  ): Promise<Series> {
    const repository = getRepository(Series);
    const serieRepository = await repository.findOne(serieId, {
      relations: ['ownerUser', 'suscribeUsers'],
    });

    if (!serieRepository) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    if (serieRepository.ownerUser.id !== currentUserId) {
      throw new ApolloError(
        SERIES_ERRORS.NOT_SERIE_OWNER.MESSAGE,
        SERIES_ERRORS.NOT_SERIE_OWNER.CODE,
      );
    }

    if (serieRepository.finishedAt) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_FINISHED.MESSAGE,
        SERIES_ERRORS.SERIE_FINISHED.CODE,
      );
    }
    if (
      serie.calendarName !== serieRepository.calendarName &&
      serie.calendarName &&
      serie.className
    ) {
      this.subscribedUsersToNewCalendar(
        serieRepository,
        serie.calendarName,
        serie.className,
      );
    }
    const topicsCollection = serie.topics.map((topicId) => ({ id: topicId }));
    await this.uploadFileSeries(
      currentUserId,
      serieRepository.id,
      avatar,
      backgroundImage,
    );
    await repository.save({
      id: serieId,
      calendarName: serie.calendarName,
      className: serie.className,
      seriesName: serie.seriesName,
      description: serie.description,
      topics: topicsCollection,
    });

    this.editSchedule(schedules, serieRepository);

    return (await repository.findOne(serieId, {
      relations: ['ownerUser', 'schedule'],
    })) as Series;
  }

  async editSchedule(
    schedules: [ScheduleCreation],
    serie: Series,
  ): Promise<void> {
    await this.deleteSchedules(serie.id);
    const repositorySchedule = getRepository(Schedule);
    for await (const schedule of schedules) {
      await repositorySchedule.save({
        day: schedule.day,
        startSerie: schedule.start,
        endSerie: schedule.end,
        serie,
      });
    }
  }

  async leaveSerie(currentUserId: number, serieId: number): Promise<Series> {
    const repository = getRepository(Series);
    const serie = await repository.findOne(serieId, {
      relations: ['ownerUser', 'suscribeUsers'],
    });
    const userRepository = getRepository(User);
    const userToLeave = await userRepository.findOne(currentUserId);
    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }
    if (!userToLeave || !userToLeave.email) {
      throw new ApolloError(
        USERS_ERRORS.USER_NOT_FOUND.MESSAGE,
        USERS_ERRORS.USER_NOT_FOUND.CODE,
      );
    }

    const suscribeUsers = serie.suscribeUsers.filter(
      (user) => user.id !== currentUserId,
    );
    await repository.save({ id: serieId, suscribeUsers });

    if (serie.className && serie.calendarName) {
      await this.kartraService.kartraUnsubscribeCalendar(
        userToLeave.email,
        serie.calendarName,
        serie.className,
      );
    }

    return (await repository.findOne(serieId)) as Series;
  }

  async liveSerie(
    currentUser: number,
    serieId: number,
  ): Promise<SessionJoinObject> {
    const repository = getRepository(Series);
    const serie = await repository.findOne(serieId, {
      relations: ['ownerUser', 'suscribeUsers', 'session'],
    });
    const sessionRepository = getRepository(Session);

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }

    if (serie.ownerUser.id !== currentUser) {
      throw new ApolloError(
        SERIES_ERRORS.NOT_SERIE_OWNER.MESSAGE,
        SERIES_ERRORS.NOT_SERIE_OWNER.CODE,
      );
    }

    if (serie.session && !serie.session.finishedAt) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_IS_LIVE.MESSAGE,
        SERIES_ERRORS.SERIE_IS_LIVE.CODE,
      );
    }

    const topics = serie.topics.map((topicId) => topicId.id);
    const topicsCollection = topics.map((topicId) => ({ id: topicId }));
    const {
      vonageSessionToken,
      vonageUserToken,
      token,
      vonageApiToken,
      session,
    } = await this.sessionsService.createSession(
      currentUser,
      [topics[0]],
      serie.seriesName,
      serie.description,
    );
    await sessionRepository.save({
      id: session.id,
      topics: topicsCollection,
    });
    const sessionSave = (await sessionRepository.findOne(
      session.id,
    )) as Session;
    await repository.save({
      id: serieId,
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

  async deleteSchedules(serieId: number): Promise<SeriesObject> {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Schedule)
      .where('serie = :serieId', { serieId })
      .execute();
    const repository = getRepository(Series);
    return (await repository.findOne(serieId)) as Series;
  }

  async getLiveSeries(): Promise<SeriesObject[]> {
    return await getRepository(Series)
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.session', 'session')
      .leftJoinAndSelect('series.suscribeUsers', 'suscribeUsers')
      .where('series.finishedAt is null')
      .andWhere('series.session is not null')
      .andWhere('session.finishedAt is null')
      .orderBy('series.createdAt', 'DESC')
      .getMany();
  }

  async getSerieById(id: number): Promise<SeriesObject> {
    const repository = getRepository(Series);
    const serie = (await repository.findOne(id, {
      relations: ['session', 'schedule'],
    })) as Series;

    if (!serie) {
      throw new ApolloError(
        SERIES_ERRORS.SERIE_NOT_FOUND.MESSAGE,
        SERIES_ERRORS.SERIE_NOT_FOUND.CODE,
      );
    }
    return serie;
  }

  async getSeriesPaging(limit: number, page: number): Promise<Series[]> {
    const skips = limit * (page - 1);
    await this.endSeries();
    const series = await getRepository(Series)
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.session', 'session')
      .leftJoinAndSelect('series.suscribeUsers', 'suscribeUsers')
      .leftJoinAndSelect('series.schedule', 'schedule')
      .where('series.finishedAt is null')
      .andWhere(
        'session.finishedAt is not null OR series.session is null AND series.finishedAt is null',
      )
      .orderBy('series.id', 'DESC')
      .getMany();

    const sortSerie = this.sortByDayWeek(series);
    const serie = sortSerie.slice(skips, limit + skips);

    return serie;
  }

  async endSeries(): Promise<void> {
    const repository = getRepository(Series);
    const series = await getRepository(Series)
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.session', 'session')
      .where('series.finishedAt is null')
      .andWhere('series.session is not null AND session.finishedAt is not null')
      .orderBy('series.id', 'DESC')
      .getMany();

    series.map((serie) => {
      repository.save({
        id: serie.id,
        session: null,
      });
    });
  }

  async getSeriesLivePaging(
    idUser: number,
    limit: number,
    page: number,
  ): Promise<SeriesViewers[]> {
    const skips = limit * (page - 1);
    let series = await getRepository(Series)
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.session', 'session')
      .leftJoinAndSelect('series.suscribeUsers', 'suscribeUsers')
      .leftJoinAndSelect('series.ownerUser', 'ownerUser')
      .leftJoinAndSelect('series.topics', 'topics')
      .leftJoinAndSelect('series.schedule', 'schedule')
      .where('series.finishedAt is null')
      .andWhere('series.session is not null')
      .andWhere('session.finishedAt is null')
      .orderBy('series.createdAt', 'DESC')
      .getMany();

    const total = series.length;
    const sortSerie = this.sortByDayWeek(series);
    series = sortSerie.slice(skips, limit + skips);

    return series.map((serie) => {
      const { suscribeUsers } = serie;
      const isSuscribed = [...suscribeUsers].some((User) => User.id === idUser);
      const viewers = serie.session
        ? this.sessionsService.countViewers(serie.session)
        : 0;
      return {
        ...serie,
        viewers,
        subscribed: isSuscribed,
        paging: { page: page, limit, total },
      };
    });
  }

  sortByDayWeek(series: Series[]): Series[] {
    const serieSort: Series[] = [];
    const currentDay = new Date(Date.now()).getDay();

    const DAY_WEEK = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

    for (let i = 0; i < DAY_WEEK.length; i++) {
      const dayWeek =
        i + currentDay < 7
          ? i + currentDay
          : i - (DAY_WEEK.length - currentDay);
      for (const serie of series) {
        for (const schedule of serie.schedule) {
          if (DAY_WEEK[dayWeek] === schedule.day.toLocaleLowerCase()) {
            serieSort.push(serie);
          }
        }
      }
    }
    return [...new Set(serieSort)];
  }

  async getSerieOwner(id: number): Promise<User> {
    return getConnection()
      .createQueryBuilder()
      .relation(Series, 'ownerUser')
      .of(id)
      .loadOne() as Promise<User>;
  }

  async getUserTopics(serieId: number): Promise<Topic[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Series, 'topics')
      .of(serieId)
      .loadMany();
  }

  async getsuscribeUsers(id: number): Promise<User[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(Series, 'suscribeUsers')
      .of(id)
      .loadMany();
  }

  async subscribed(serieId: number, currentUserId: number): Promise<boolean> {
    const repository = getRepository(Series);
    const { suscribeUsers } = (await repository.findOne(serieId, {
      relations: ['suscribeUsers'],
    })) as Series;
    return [...suscribeUsers].some((User) => User.id === currentUserId);
  }

  async subscribedUsersToNewCalendar(
    serie: Series,
    calendarName: string,
    className: string,
  ): Promise<void> {
    for await (const user of serie.suscribeUsers) {
      if (serie.calendarName && serie.className) {
        await this.kartraService.kartraSuscribeLeadCalendar(
          user.email || '',
          calendarName,
          className || serie.className,
        );
        await this.kartraService.kartraUnsubscribeCalendar(
          user.email || '',
          serie.calendarName,
          serie.className,
        );
      }
    }
  }
}

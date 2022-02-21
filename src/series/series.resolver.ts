import {
  Resolver,
  Mutation,
  Args,
  Int,
  Query,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { SeriesServices } from './series.service';
import { JwtGuard } from '../lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';
import { UseGuards } from '@nestjs/common';
import {
  SeriesObject,
  SerieCreation,
  serieEdit,
  ScheduleCreation,
  SeriesViewers
} from './series.graphql';
import { GraphQLUpload } from 'apollo-server-express';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { UserProfile } from '../users/users.graphql';
import { Topic } from '../topics/topic.entity';
import { SessionJoinObject } from '../sessions/sessions.graphql';
import { PagingInput } from '../lib/common/common.graphql';

@Resolver(() => SeriesObject)
export class SeriesResolver {
  constructor(private seriesServices: SeriesServices) {}

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async createSerie(
    @CurrentUser() currentUser: BasePayload,
    @Args('serie') serie: SerieCreation,
    @Args('schedule', { type: () => [ScheduleCreation] })
    schedule: [ScheduleCreation],
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<SeriesObject> {
    return this.seriesServices.createSerie(
      currentUser.id,
      serie,
      schedule,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async uploadFileSeries(
    @CurrentUser() currentUser: BasePayload,
    @Args('idSerie')
    idSerie: number,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<SeriesObject> {
    return this.seriesServices.uploadFileSeries(
      currentUser.id,
      idSerie,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async invitedUsersSeries(
    @CurrentUser() currentUser: BasePayload,
    @Args('invitedUsers', { type: () => [Int] })
    invitedUsers: [number],
    @Args('idSerie')
    idSerie: number,
  ): Promise<SeriesObject> {
    return this.seriesServices.invitedUsersSeries(
      currentUser.id,
      invitedUsers,
      idSerie,
    );
  }

  @Query(() => [SeriesObject])
  @UseGuards(JwtGuard)
  async getUserSeries(
    @CurrentUser() currentUser: BasePayload,
    @Args('id', { nullable: true }) userId?: number,
  ): Promise<SeriesObject[]> {
    return this.seriesServices.getUserSeries(currentUser.id, userId);
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async joinSerie(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') serieId: number,
  ): Promise<SeriesObject> {
    return this.seriesServices.joinSerie(currentUser.id, serieId);
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async endSerie(
    @CurrentUser() currentUser: BasePayload,
    @Args('serieId') serieId: number,
  ): Promise<SeriesObject> {
    return this.seriesServices.endSerie(currentUser.id, serieId);
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async editSerie(
    @CurrentUser() currentUser: BasePayload,
    @Args('serieId') serieId: number,
    @Args('serie') serie: serieEdit,
    @Args('schedule', { type: () => [ScheduleCreation] })
    schedule: [ScheduleCreation],
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<SeriesObject> {
    return await this.seriesServices.editSerie(
      currentUser.id,
      serieId,
      schedule,
      serie,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => SeriesObject)
  @UseGuards(JwtGuard)
  async leaveSerie(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('id') serieId: number,
  ): Promise<SeriesObject> {
    return this.seriesServices.leaveSerie(CurrentUser.id, serieId);
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async liveSerie(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('SerieId') serieId: number,
  ): Promise<SessionJoinObject> {
    return this.seriesServices.liveSerie(CurrentUser.id, serieId);
  }

  @Query(() => [SeriesObject])
  @UseGuards(JwtGuard)
  async getLiveSeries(
    @CurrentUser() CurrentUser: BasePayload,
  ): Promise<SeriesObject[]> {
    return this.seriesServices.getLiveSeries();
  }

  @Query(() => SeriesObject)
  @UseGuards(JwtGuard)
  async getSerieById(@Args('id') serieId: number): Promise<SeriesObject> {
    return this.seriesServices.getSerieById(serieId);
  }

  @Query(() => [SeriesObject])
  @UseGuards(JwtGuard)
  async getSeriePaging(
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<SeriesObject[]> {
    return this.seriesServices.getSeriesPaging(
      paging.limit,
      paging.page,
    );
  }

  @Query(() => [SeriesViewers])
  @UseGuards(JwtGuard)
  async getLiveSeriePaging(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<SeriesViewers[]> {
    return this.seriesServices.getSeriesLivePaging(
      CurrentUser.id,
      paging.limit,
      paging.page,
    );
  }

  @ResolveField('ownerUser', () => UserProfile)
  async ownerUser(@Parent() seriesObject: SeriesObject): Promise<UserProfile> {
    return this.seriesServices.getSerieOwner(seriesObject.id);
  }

  @ResolveField('topics', () => [Topic])
  async topics(@Parent() seriesObject: SeriesObject): Promise<Topic[]> {
    return this.seriesServices.getUserTopics(seriesObject.id);
  }

  @ResolveField('suscribeUsers', () => [UserProfile])
  async suscribeUsers(
    @Parent() seriesObject: SeriesObject,
  ): Promise<UserProfile[]> {
    return this.seriesServices.getsuscribeUsers(seriesObject.id);
  }

  @ResolveField('subscribed', () => Boolean)
  async subscribed(
    @Parent() seriesObject: SeriesObject,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<boolean> {
    return this.seriesServices.subscribed(seriesObject.id, currentUser.id);
  }
}

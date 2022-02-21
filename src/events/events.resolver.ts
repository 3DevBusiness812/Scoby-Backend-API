import { UseGuards, UsePipes } from '@nestjs/common';
import {
  Mutation,
  Resolver,
  Args,
  Query,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { JwtGuard } from 'src/lib/jwt/jwt.guard';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { BasePayload } from '../lib/jwt/jwt.service';
import { GraphQLUpload } from 'apollo-server-express';
import { FileUpload, Paging } from '../lib/common/common.interfaces';
import { EventsService } from './events.service';
import { EventCreation, EventsObject, EventUpdate } from './events.graphql';
import { UserProfile } from '../users/users.graphql';
import { SessionJoinObject } from '../sessions/sessions.graphql';
import { Topic } from '../topics/topic.entity';
import { PagingPipe } from '../lib/common/common.pipe';
import { PagingInput } from '../lib/common/common.graphql';

@Resolver(() => EventsObject)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async createEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('event') event: EventCreation,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    return this.eventsService.createEvent(
      currentUser.id,
      event,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async editEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') idEvent: number,
    @Args('event') event: EventUpdate,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    return this.eventsService.editEvent(
      currentUser.id,
      idEvent,
      event,
      avatar,
      backgroundImage,
    );
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async uploadFileEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('id')
    idEvent: number,
    @Args('avatar', { nullable: true, type: () => GraphQLUpload })
    avatar?: FileUpload,
    @Args('backgroundImage', { nullable: true, type: () => GraphQLUpload })
    backgroundImage?: FileUpload,
  ): Promise<EventsObject> {
    return this.eventsService.uploadFileEvent(
      currentUser.id,
      idEvent,
      avatar,
      backgroundImage,
    );
  }

  @Query(() => [EventsObject])
  @UseGuards(JwtGuard)
  async getUserEvents(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('id', { nullable: true }) userId?: number,
  ): Promise<EventsObject[]> {
    return this.eventsService.getUserEvents(CurrentUser.id, userId);
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async invitedUserEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('invitedUsers', { type: () => [Int] })
    invitedUsers: [number],
    @Args('idEvent')
    idEvent: number,
  ): Promise<EventsObject> {
    return this.eventsService.invitedUsersEvent(
      currentUser.id,
      invitedUsers,
      idEvent,
    );
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async joinEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('id') idEvent: number,
  ): Promise<EventsObject> {
    return this.eventsService.joinEvent(currentUser.id, idEvent);
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async leaveEvent(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('id') idEvent: number,
  ): Promise<EventsObject> {
    return this.eventsService.leaveEvent(CurrentUser.id, idEvent);
  }

  @Mutation(() => SessionJoinObject)
  @UseGuards(JwtGuard)
  async liveEvent(
    @CurrentUser() CurrentUser: BasePayload,
    @Args('idEvent') idEvent: number,
  ): Promise<SessionJoinObject> {
    return this.eventsService.liveEvent(CurrentUser.id, idEvent);
  }

  @Query(() => EventsObject)
  @UseGuards(JwtGuard)
  async getEventbyId(@Args('id') idEvent: number): Promise<EventsObject> {
    return this.eventsService.getEventById(idEvent);
  }

  @Query(() => [EventsObject])
  @UseGuards(JwtGuard)
  async getLiveEvents(): Promise<EventsObject[]> {
    return this.eventsService.getLiveEvents();
  }

  @Mutation(() => EventsObject)
  @UseGuards(JwtGuard)
  async endEvent(
    @CurrentUser() currentUser: BasePayload,
    @Args('idEvent') id: number,
  ): Promise<EventsObject> {
    return this.eventsService.endEvent(currentUser.id, id);
  }

  @Query(() => [EventsObject])
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getLiveEventsPaging(
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<EventsObject[]> {
    return this.eventsService.getLiveEventsPaging(paging.limit,paging.page);
  }
  @Query(() => [EventsObject])
  @UseGuards(JwtGuard)
  @UsePipes(PagingPipe)
  async getEventsPaging(
    @Args('paging', { type: () => PagingInput, nullable: true }) paging: Paging,
  ): Promise<EventsObject[]> {
    return this.eventsService.getEventsPaging(paging.limit,paging.page);
  }


  @ResolveField('suscribeUsers', () => [UserProfile])
  async suscribeUsers(
    @Parent() eventsObject: EventsObject,
  ): Promise<UserProfile[]> {
    return this.eventsService.getsuscribeUsers(eventsObject.id);
  }

  @ResolveField('topics', () => [Topic])
  async topics(@Parent() eventsObject: EventsObject): Promise<Topic[]> {
    return this.eventsService.getUserTopics(eventsObject.id);
  }

  @ResolveField('subscribed', () => Boolean)
  async subscribed(
    @Parent() eventsObject: EventsObject,
    @CurrentUser() currentUser: BasePayload,
  ): Promise<boolean> {
    return this.eventsService.subscribed(eventsObject.id, currentUser.id);
  }

  @ResolveField('viewers', () => Number)
  async viewers(@Parent() eventsObject: EventsObject): Promise<number> {
    return this.eventsService.getViewers(eventsObject.id);
  }

  @ResolveField('ownerUser', () => UserProfile)
  async ownerUser(@Parent() eventsObject: EventsObject): Promise<UserProfile> {
    return this.eventsService.getEventOwner(eventsObject.id);
  }
}

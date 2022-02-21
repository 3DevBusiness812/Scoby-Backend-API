import { UseGuards, UsePipes } from '@nestjs/common';
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
import { PubSub } from 'graphql-subscriptions';
import { UserProfile } from 'src/users/users.graphql';
import { CurrentUser } from '../lib/common/current-user.decorator';
import { JwtGuard } from '../lib/jwt/jwt.guard';
import { BasePayload } from '../lib/jwt/jwt.service';
import { ChatMessageObject, ChatRoomObject } from './chat.graphql';
import { MessageGuard } from './chat.guard';
import { newMessageSubscriptionFilter } from './chat.helpers';
import { CHAT_SUBS } from './chat.messages';
import { ChatMessageCreationPipe, ChatRoomCreationPipe } from './chat.pipe';
import { ChatService } from './chat.service';

@Resolver(() => ChatRoomObject)
export class ChatResolver {
  constructor(private chatService: ChatService, private pubSub: PubSub) {}

  @Query(() => [ChatRoomObject])
  @UseGuards(JwtGuard)
  async getUserChatRooms(
    @CurrentUser() currentUser: BasePayload,
  ): Promise<ChatRoomObject[]> {
    return this.chatService.getChatRooms(currentUser.id);
  }

  @Mutation(() => ChatRoomObject)
  @UseGuards(JwtGuard)
  @UsePipes(ChatRoomCreationPipe)
  async createChatRoom(
    @CurrentUser() currentUser: BasePayload,
    @Args('participants', { nullable: false, type: () => [Int] })
    participants: [number],
    @Args('messageText', { nullable: false, type: () => String })
    messageText: string,
  ): Promise<ChatRoomObject> {
    const chatRoom = await this.chatService.createChatRoom([
      currentUser.id,
      ...participants,
    ]);
    const firstMessage = await this.chatService.createChatMessage(
      messageText,
      currentUser.id,
      chatRoom.id,
    );
    return firstMessage.room;
  }

  @Query(() => [ChatMessageObject])
  @UseGuards(JwtGuard)
  async getChatMessages(
    @Args('room', { nullable: false, type: () => Int })
    room: number,
  ): Promise<ChatMessageObject[]> {
    return this.chatService.getRoomMessages(room);
  }

  @Mutation(() => ChatMessageObject)
  @UseGuards(MessageGuard)
  @UsePipes(ChatMessageCreationPipe)
  async sendMessage(
    @CurrentUser() currentUser: BasePayload,
    @Args('room', { nullable: false, type: () => Int })
    room: number,
    @Args('text', { nullable: false, type: () => String })
    text: string,
  ): Promise<ChatMessageObject> {
    const newMessage = await this.chatService.createChatMessage(
      text,
      currentUser.id,
      room,
    );

    return newMessage;
  }

  @Query(() => ChatRoomObject)
  @UseGuards(JwtGuard)
  async getSpecificChatRoom(
    @CurrentUser() currentUser: BasePayload,
    @Args('userId', { nullable: false, type: () => Int })
    userId: number,
  ): Promise<ChatRoomObject> {
    return this.chatService.getChatRoomWithSpecificUser(currentUser.id, userId);
  }

  @Query(() => ChatRoomObject)
  @UseGuards(JwtGuard)
  async getChatRoomById(
    @Args('roomId', { nullable: false, type: () => Int })
    roomdId: number,
  ): Promise<ChatRoomObject> {
    return this.chatService.getChatRoomById(roomdId);
  }

  @Mutation(() => [ChatMessageObject])
  @UseGuards(JwtGuard)
  async setReadMessageStatus(
    @Args('ids', { nullable: false, type: () => [Int] })
    ids: number[],
  ): Promise<ChatMessageObject[]> {
    return this.chatService.setIsReadStatus(ids);
  }

  @Mutation(() => ChatRoomObject)
  @UseGuards(MessageGuard)
  async deleteChatRoom(
    @Args('room', { nullable: false, type: () => Int })
    room: number,
  ): Promise<ChatRoomObject> {
    return await this.chatService.deleteChatRoom(room);
  }

  @ResolveField('participantUsers', () => [UserProfile])
  async participants(@Parent() chat: ChatRoomObject): Promise<UserProfile[]> {
    return this.chatService.getChatParticipants(chat.id);
  }

  @ResolveField('messages', () => [ChatMessageObject])
  async messages(@Parent() chat: ChatRoomObject): Promise<ChatMessageObject[]> {
    return this.chatService.getRoomMessages(chat.id);
  }

  @Subscription(() => ChatMessageObject, {
    filter: (payload, variables) => {
      return newMessageSubscriptionFilter(
        payload?.newMessage?.room?.id,
        variables?.room,
      );
    },
  })
  @UseGuards(MessageGuard)
  newMessage(
    @Args('room', { nullable: false, type: () => Int })
    room: number,
  ): AsyncIterator<ChatMessageObject> {
    return this.pubSub.asyncIterator<ChatMessageObject>(CHAT_SUBS.NEW_MESSAGE);
  }
}

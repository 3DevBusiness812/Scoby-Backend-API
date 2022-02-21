import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ActivityServices } from 'src/activity/activity.service';
import { User } from 'src/users/user.entity';
import { UserProfile } from 'src/users/users.graphql';
import { getConnection, getRepository, In } from 'typeorm';
import { ChatMessage, ChatRoom } from './chat.entity';
import { ChatMessageObject, ChatRoomObject } from './chat.graphql';
import { CHAT_SUBS } from './chat.messages';

@Injectable()
export class ChatService {
  constructor(
    private pubSub: PubSub,
    private notificationService: NotificationsService,
    private activityServices:ActivityServices,
  ) {}

  async getChatRooms(id: number): Promise<ChatRoomObject[]> {
    const repo = getRepository(ChatRoom);
    return repo
      .createQueryBuilder('room')
      .innerJoinAndSelect('room.participantUsers', 'user')
      .innerJoinAndSelect('room.messages', 'messages')
      .where('user.id = :id', { id })
      .orderBy("messages.createdAt", "DESC")
      .getMany();
  }

  async getChatRoomWithSpecificUser(
    id: number,
    userId: number,
  ): Promise<ChatRoomObject> {
    const repo = getRepository(ChatRoom);

    const mainUser = await this.getChatRooms(id);

    const rooms = mainUser.map(({ id }) => id);

    return repo
      .createQueryBuilder('room')
      .innerJoinAndSelect('room.participantUsers', 'user')
      .innerJoinAndSelect('room.messages', 'messages')
      .where('user.id = :id', { id: userId })
      .andWhere('room.id IN (:...ids)', { ids: rooms })
      .addOrderBy("messages.createdAt", "DESC")
      .getOne() as Promise<ChatRoomObject>;
  }

  async getChatRoomById(roomId: number): Promise<ChatRoomObject> {
    const repo = getRepository(ChatRoom);
    return repo.findOne({ where: { id: roomId } }) as Promise<ChatRoomObject>;
  }

  async createChatRoom(participants: number[]): Promise<ChatRoomObject> {
    const repo = getRepository(ChatRoom);
    const participantUsers = participants.map((id) => ({ id }));

    return await repo.save({
      participantUsers,
    });
  }

  async getChatParticipants(id: number): Promise<UserProfile[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(ChatRoom, 'participantUsers')
      .of(id)
      .loadMany();
  }

  async getChatRoomMessages(id: number): Promise<ChatMessageObject[]> {
    return getConnection()
      .createQueryBuilder()
      .relation(ChatRoom, 'messages')
      .of(id)
      .loadMany();
  }

  async getRoomMessages(id: number): Promise<ChatMessageObject[]> {
    const repo = getRepository(ChatMessage);
    return repo.find({ where: { room: { id } }, order: { createdAt: 'ASC' } });
  }

  async createChatMessage(
    text: string,
    sender: number,
    room: number,
  ): Promise<ChatMessageObject> {
    const repo = getRepository(ChatMessage);

    const newMessage = await repo.save({
      text,
      sender: {
        id: sender,
      },
      room: {
        id: room,
      },
    });

    await this.publishNewMessage(newMessage);
    await this.newMessageNotification(newMessage);

    return newMessage;
  }

  async getMessageSender(id: number): Promise<User> {
    return getConnection()
      .createQueryBuilder()
      .relation(ChatMessage, 'sender')
      .of(id)
      .loadOne() as Promise<User>;
  }

  async getMessageRoom(id: number): Promise<ChatRoom> {
    return getConnection()
      .createQueryBuilder()
      .relation(ChatMessage, 'room')
      .of(id)
      .loadOne() as Promise<ChatRoom>;
  }

  async publishNewMessage(newMessage: ChatMessage): Promise<void> {
    const participantUsers = await this.getChatParticipants(newMessage.room.id);

    const participantsIds = participantUsers.map(({ id }) => id);

    await this.pubSub.publish(CHAT_SUBS.NEW_MESSAGE, {
      newMessage: {
        ...newMessage,
        room: { ...newMessage.room, participantUsers: participantsIds },
      },
    });
  }

  async newMessageNotification(newMessage: ChatMessage): Promise<void> {
    const participantUsers = await this.getChatParticipants(newMessage.room.id);

    const receiverId = participantUsers
      .map(({ id }) => id)
      .filter((id) => id !== newMessage.sender.id)[0];

    await this.notificationService.newMessageNotification(
      receiverId,
      newMessage.sender.id,
      newMessage.text,
    );
      
    const AllParticipantUsers = participantUsers
    .map(({id})=> id)
    .filter((id) => id!==newMessage.sender.id)
    
    await this.activityServices.sendGroupNotificationActivity(
      AllParticipantUsers,
      newMessage.room.id,
      newMessage.sender.id,
      "message"
      );

  }

  async setIsReadStatus(ids: number[]): Promise<ChatMessage[]> {
    const repo = getRepository(ChatMessage);
    const promises = ids.map(async (messageId) => {
      const message = await repo.findOne(messageId);
      return await repo.save({
        ...message,
        id: messageId,
        isRead: true,
      });
    });
    return await Promise.all(promises);
  }

  async deleteChatRoom(roomId: number): Promise<ChatRoomObject> {
    const repo = getRepository(ChatRoom);
    const chat = repo.findOne(roomId);
    await repo.delete(roomId);
    return chat as Promise<ChatRoomObject>;
  }
}

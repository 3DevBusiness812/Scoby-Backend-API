import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserProfile } from 'src/users/users.graphql';
import { ChatMessageObject, ChatRoomObject } from './chat.graphql';
import { ChatService } from './chat.service';

@Resolver(() => ChatMessageObject)
export class ChatMessageResolver {
  constructor(
    private chatService: ChatService,
  ) {}

  @ResolveField('sender', () => UserProfile)
  async sender(@Parent() message: ChatMessageObject): Promise<UserProfile> {
    return this.chatService.getMessageSender(message.id);
  }

  @ResolveField('room', () => ChatRoomObject)
  async room (@Parent() message: ChatMessageObject): Promise<ChatRoomObject> {
    return this.chatService.getMessageRoom(message.id)
  }
}

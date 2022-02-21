import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserProfile } from 'src/users/users.graphql';

@ObjectType()
export class ChatRoomObject {
  @Field(() => Int)
  id: number;

  @Field(() => [UserProfile], { nullable: false })
  participantUsers: UserProfile[];

  @Field(() => [ChatMessageObject], {nullable: true})
  messages: ChatMessageObject[];
}

@ObjectType()
export class ChatMessageObject {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  text: string;

  @Field(() => UserProfile)
  sender: UserProfile;

  @Field()
  room: ChatRoomObject;

  @Field(() => Boolean)
  isRead: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

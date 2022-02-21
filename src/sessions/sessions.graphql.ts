import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserProfile } from '../users/users.graphql';
import { Topic } from '../topics/topics.graphql';

@ObjectType()
export class SessionObject {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  ownerUser: UserProfile;

  @Field(() => [UserProfile])
  participantUsers: UserProfile[];

  @Field(() => [UserProfile])
  greenRoomUsers: UserProfile[];

  @Field(() => [UserProfile])
  viewerUsers: UserProfile[];

  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => Date, { nullable: true })
  finishedAt?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  vonageSessionToken: string | null;

  @Field(() => String, { nullable: true })
  secondScreenLink?: string | null;

  @Field()
  viewers: number;

  @Field(() => Boolean)
  isPrivate: boolean;

  @Field(() => [UserProfile])
  invitedUsers: UserProfile[];
}

@ObjectType()
export class SessionJoinObject {
  @Field()
  session: SessionObject;

  @Field()
  vonageSessionToken: string;

  @Field()
  vonageUserToken: string;

  @Field()
  token: string;

  @Field()
  vonageApiToken: string;
}

@ObjectType()
export class SessionLiveToSerie{
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  ownerUser: UserProfile;

  @Field(() => [UserProfile], { nullable: true })
  participantUsers: UserProfile[];

  @Field(() => [UserProfile], { nullable: true })
  greenRoomUsers: UserProfile[];

  @Field(() => [UserProfile], { nullable: true })
  viewerUsers: UserProfile[];

  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => Date, { nullable: true })
  finishedAt?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  vonageSessionToken: string | null;

  @Field(() => String, { nullable: true })
  secondScreenLink?: string | null;

}

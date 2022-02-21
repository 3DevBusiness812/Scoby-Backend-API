import { ObjectType, Int, Field, InputType } from '@nestjs/graphql';
import { UserProfile } from '../users/users.graphql';
import { SessionLiveToSerie } from 'src/sessions/sessions.graphql';
import { Topic } from '../topics/topics.graphql';

@ObjectType()
export class EventsObject {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field()
  ownerUser: UserProfile;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String, { nullable: true })
  backgroundImage?: string | null;

  @Field(() => [UserProfile])
  suscribeUsers: UserProfile[];

  @Field(() => SessionLiveToSerie, { nullable: true })
  session?: SessionLiveToSerie | null;

  @Field(() => [Topic], { nullable: true })
  topics: Topic[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String)
  start: Date;

  @Field(() => String)
  end: Date;

  @Field(() => String)
  day: Date;

  @Field(() => Date, { nullable: true })
  finishedAt?: Date | null;

  @Field(() => Boolean)
  subscribed?: boolean | null;

  @Field(() => Number)
  viewers?: number | null;
}

@InputType()
export class EventCreation {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];

  @Field(() => [Int], { nullable: true })
  invitedUsers: [number];

  @Field(() => String)
  day: string;

  @Field(() => String)
  start: string;

  @Field(() => String)
  end: string;
}

@InputType()
export class EventUpdate {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];

  @Field(() => String, { nullable: true })
  day?: string | null;

  @Field(() => String, { nullable: true })
  start?: string | null;

  @Field(() => String, { nullable: true })
  end?: string | null;
}

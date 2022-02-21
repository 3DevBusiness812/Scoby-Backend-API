import { ObjectType, Int, Field, InputType } from '@nestjs/graphql';
import { Topic } from '../topics/topics.graphql';
import { UserProfile } from '../users/users.graphql';
import { SessionLiveToSerie } from 'src/sessions/sessions.graphql';
import { ScheduleObject } from './schedule.graphql';
import { PagingObject } from '../lib/common/common.graphql';
@ObjectType()
export class SeriesObject {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  calendarName?: string | null;

  @Field(() => String, { nullable: true })
  className?: string | null;

  @Field(() => String)
  seriesName: string;

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

  @Field(() => [Topic], { nullable: true })
  topics: Topic[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  finishedAt?: Date | null;

  @Field(() => SessionLiveToSerie, { nullable: true })
  session?: SessionLiveToSerie | null;

  @Field(() => [ScheduleObject], { nullable: true })
  schedule?: ScheduleObject[] | null;

  @Field(() => Boolean)
  subscribed?: boolean | null;
}

@InputType()
export class SerieCreation {
  @Field(() => String, { nullable: true })
  calendarName?: string | null;

  @Field(() => String, { nullable: true })
  className?: string | null;

  @Field(() => String)
  seriesName: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];

  @Field(() => [Int], { nullable: true })
  invitedUsers: [number];
}

@InputType()
export class ScheduleCreation {
  @Field(() => String)
  day: string;

  @Field(() => String)
  start: string;

  @Field(() => String)
  end: string;

  @Field(() => Int, { nullable: true })
  idSerie: number;
}

@InputType()
export class serieEdit {
  @Field(() => String, { nullable: true })
  calendarName: string;

  @Field(() => String, { nullable: true })
  className: string;

  @Field(() => String)
  seriesName: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];
}

@ObjectType()
export class SeriesViewers extends SeriesObject {
  @Field()
  viewers: number;

  @Field(() => Boolean)
  subscribed?: boolean | null;

  @Field()
  paging: PagingObject;
}

import { ObjectType, Int, Field, InputType } from '@nestjs/graphql';
import { UserProfile } from '../users/users.graphql';
import { Topic } from '../topics/topics.graphql';
import { TeamType } from './team.types';
import { PagingObject } from 'src/lib/common/common.graphql';

@ObjectType()
export class TeamObject {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  ownerUser: UserProfile;

  @Field(() => String, { nullable: true })
  linkWebsite?: string | null;

  @Field(() => [UserProfile])
  participantUsers: UserProfile[];

  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => Date, { nullable: true })
  finishedAt?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [TeamMemberObject], { nullable: true })
  members: TeamMemberObject[];

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String, { nullable: true })
  backgroundImage?: string | null;

  @Field(() => String)
  teamType: string;

  @Field(() => Boolean)
  membersAllowedToHost: boolean;

  @Field(() => Boolean)
  membersAllowedToInvite: boolean;

  @Field(() => [UserProfile], {nullable: true})
  pendingUsers: UserProfile[];
}

@ObjectType()
export class TeamMemberObject {
  @Field(() => Int)
  id: number;

  @Field()
  team: TeamObject;

  @Field(() => Boolean, { nullable: true })
  isAccepted: boolean;

  @Field(() => UserProfile, { nullable: false })
  user: UserProfile;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class TeamCreation {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];

  @Field(() => [Int], { nullable: true })
  invitedUsers: number[];

  @Field(() => String)
  teamType: TeamType;

  @Field(() => Boolean)
  membersAllowedToHost: boolean;

  @Field(() => Boolean)
  membersAllowedToInvite: boolean;
}

@InputType()
export class TeamUpdate {
  @Field(() => Int)
  teamId: number;

  @Field(() => String)
  teamType: TeamType;

  @Field(() => Boolean)
  membersAllowedToHost: boolean;

  @Field(() => Boolean)
  membersAllowedToInvite: boolean;
}

@InputType()
export class EditTeam {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [Int])
  topics: number[];

  @Field(() => Int)
  teamId: number;

  @Field(() => String, { nullable: true })
  linkWebsite?: string | null;
}

@ObjectType()
export class PaginatedTeams {
  @Field(() => [TeamObject])
  data: TeamObject[];

  @Field()
  paging: PagingObject;
}

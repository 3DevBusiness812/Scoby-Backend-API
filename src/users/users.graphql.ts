import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Topic } from '../topics/topics.graphql';
import { PagingObject } from '../lib/common/common.graphql';

@ObjectType()
export class UserVerificationExpire {
  @Field()
  phone: string;

  @Field()
  verificationExpire: Date;
}

@ObjectType()
export class UserVerificationResult {
  @Field()
  registrationToken: string;
}

@ObjectType()
export class ResetPasswordVerificationResult {
  @Field()
  passwordResetToken: string;
}

@InputType()
export class UserProfileCreation {
  @Field()
  registrationToken: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  birthday: Date;

  @Field()
  email: string;

  @Field()
  fullName: string;

  @Field(() => [Int])
  topics: number[];
}

@ObjectType()
export class UserLoginResult {
  @Field()
  authorizationToken: string;
}

@ObjectType()
export class FollowCounts {
  @Field(() => Int)
  followers: number;

  @Field(() => Int)
  following: number;
}

@ObjectType()
export class FollowStats {
  @Field(() => Boolean, { nullable: true })
  followingCurrentUser?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  followedByCurrentUser?: boolean | null;
}

@ObjectType()
export class UserProfile {
  @Field(() => Int)
  id: number;

  @Field()
  phone: string;

  @Field()
  username: string;

  @Field()
  birthday: Date;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  role?: string | null;

  @Field(() => String, { nullable: true })
  backgroundImage?: string | null;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  website?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => FollowCounts)
  followCounts?: FollowCounts;

  @Field(() => FollowStats)
  followStats?: FollowStats;

  @Field(() => String, { nullable: true })
  vonageUserToken: string | null;

  @Field(() => String, { nullable: true })
  publicKey?: string | null;
}

@ObjectType()
export class UserProfileWithAuth extends UserProfile {
  @Field(() => UserLoginResult)
  auth: UserLoginResult;

  @Field(() => [Topic])
  topics: Topic[];
}

@InputType()
export class UserProfileEdit {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  birthday?: Date;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  website?: string | null;

  @Field(() => [Int], { nullable: true })
  topics?: number[];

  @Field(() => String, { nullable: true })
  publicKey?: string | null;
}

@InputType()
export class LeadCreation {
  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@ObjectType()
export class LeadCreationResult {
  @Field()
  phone: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@ObjectType()
export class GetUsersResult {
  @Field(() => [UserProfile])
  data: UserProfile[];

  @Field()
  paging: PagingObject;

  @Field(() => String, { nullable: true })
  query?: string | null;
}

@ObjectType()
export class InappropriateCheckResult {
  @Field(() => Int)
  userId: number;

  @Field()
  inappropriate: boolean;
}

@ObjectType()
export class LeadSuscriptionList {
  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class SuscribeLeadCalendar {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  className: string;
}

@ObjectType()
export class responseKartra {
  @Field()
  message: string;

  @Field()
  type: number;
}

@ObjectType()
export class RecommendationsData {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  birthday: Date;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => [UserProfile])
  follows: UserProfile[];
}

@ObjectType()
export class RecommendationsDataAllUsers {
  @Field(() => [RecommendationsData])
  users: RecommendationsData[];
}

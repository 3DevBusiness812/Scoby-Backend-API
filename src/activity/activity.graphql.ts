import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserProfile } from '../users/users.graphql';
import { PagingObject } from '../lib/common/common.graphql';
@ObjectType()
export class ActivityUser {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  type_action: string;

  @Field(() => Int, { nullable: true })
  procedure_action?: number | null;

  @Field(() => UserProfile)
  sourceUser: UserProfile;

  @Field(() => String, { nullable: true })
  additionalPayload: string;
}

@ObjectType()
export class getActivity {
  @Field(() => [ActivityUser])
  data: ActivityUser[];

  @Field()
  paging: PagingObject;
}

@ObjectType()
export class ActivityCounter {
  @Field()
  counter: number;
}

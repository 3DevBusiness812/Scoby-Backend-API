import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';

@ArgsType()
export class PushTokenCreation {
  @Field()
  deviceId: string;

  @Field()
  token: string;
}

@ObjectType()
export class PushTokenObject {
  @Field(() => Int)
  id: number;

  @Field()
  deviceId: string;

  @Field()
  token: string;
}

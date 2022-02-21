import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Ping {
  @Field()
  ping: string;
}

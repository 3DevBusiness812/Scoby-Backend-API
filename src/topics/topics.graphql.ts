import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Topic {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  icon: string;
}

@InputType()
export class TopicInput {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  icon: string;
}

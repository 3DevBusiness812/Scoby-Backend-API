import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class PagingInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class PagingObject {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;
}

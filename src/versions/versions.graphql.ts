import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionObject {
  @Field()
  version: string;
}

import { ObjectType, Int, Field } from '@nestjs/graphql';

@ObjectType()
export class ScheduleObject {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  day?: string;

  @Field(() => String, { nullable: true, name: 'start' })
  startSerie?: Date;

  @Field(() => String, { nullable: true, name: 'end' })
  endSerie?: Date;
}

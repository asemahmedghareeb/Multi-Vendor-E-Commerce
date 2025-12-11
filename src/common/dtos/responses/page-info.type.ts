import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasNext: boolean;

  @Field()
  hasPrevious: boolean;
}

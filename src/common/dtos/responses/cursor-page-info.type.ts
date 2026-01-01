import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CursorPageInfo {
  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean, { nullable: true })
  hasMore?: boolean;
}

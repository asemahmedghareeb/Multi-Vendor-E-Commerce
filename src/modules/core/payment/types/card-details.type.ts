import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CardDetailsType {
  @Field(() => String, { nullable: true })
  brand?: string;

  @Field(() => String, { nullable: true })
  lastFourNumbers?: string;

  @Field(() => Number, { nullable: true })
  expMonth?: number;

  @Field(() => Number, { nullable: true })
  expYear?: number;
}

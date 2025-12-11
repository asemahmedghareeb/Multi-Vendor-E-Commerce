import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StaticCountry {
  @Field()
  code: string;

  @Field()
  name: string;
}

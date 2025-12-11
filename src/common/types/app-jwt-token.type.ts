import { Field, ObjectType } from '@nestjs/graphql';
import { TimestampScalar } from '../scalars/timestamp.scalar';

@ObjectType()
export class AppJwtToken {
  @Field()
  accessToken: string;

  @Field(() => TimestampScalar)
  accessTokenExpiresAt: Date;

  @Field()
  refreshToken: string;

  @Field(() => TimestampScalar)
  refreshTokenExpiresAt: Date;
}

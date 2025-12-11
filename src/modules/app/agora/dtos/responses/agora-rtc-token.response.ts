import { Field, ObjectType } from '@nestjs/graphql';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';

@ObjectType()
export class AgoraRtcTokenResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;

  @Field(() => TimestampScalar)
  expireDate: Date;

  @Field()
  uid: number;
}

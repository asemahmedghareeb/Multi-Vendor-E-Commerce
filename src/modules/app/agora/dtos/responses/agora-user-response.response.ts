import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/modules/app/auth-base/user/entities/user.entity';
import { ChannelMemberTypeEnum } from '../../enums/channel-member-type.enum';

@ObjectType()
export class AgoraUserResponse {
  @Field(() => User)
  user: User;

  @Field(() => ChannelMemberTypeEnum)
  type: ChannelMemberTypeEnum;

  @Field()
  uid: number;
}

import { registerEnumType } from '@nestjs/graphql';

export enum ChannelMemberTypeEnum {
  MEMBER = 'MEMBER',
  SCREEN_SHARING = 'SCREEN_SHARING',
}

registerEnumType(ChannelMemberTypeEnum, {
  name: 'ChannelMemberTypeEnum',
});

import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AGORA_CHANNEL_NAME_REGEX } from 'src/consts/regex/regex.const';
import { ChannelMemberTypeEnum } from 'src/modules/app/agora/enums/channel-member-type.enum';

@ArgsType()
export class GenerateAgoraRtcTokenInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(AGORA_CHANNEL_NAME_REGEX, {
    message:
      'Invalid channel name. Only letters, numbers, "-" and "_" allowed (1–64 characters).',
  })
  channelName: string;

  @Field(() => ChannelMemberTypeEnum)
  type: ChannelMemberTypeEnum;
}

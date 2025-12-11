import { ArgsType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';

@ArgsType()
export class RequestUserVerificationCodeInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => SmsStrategyEnum, { defaultValue: SmsStrategyEnum.SMS })
  smsStrategy: SmsStrategyEnum;
}

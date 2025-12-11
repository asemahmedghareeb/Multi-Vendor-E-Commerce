import { ArgsType, Field } from '@nestjs/graphql';
import { IsPhoneNumber } from 'class-validator';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';

@ArgsType()
export class RequestUpdatePhoneNumberVerificationCodeInput {
  @Field()
  @IsPhoneNumber()
  newPhoneNumber: string;

  @Field(() => SmsStrategyEnum, { defaultValue: SmsStrategyEnum.SMS })
  smsStrategy: SmsStrategyEnum;
}

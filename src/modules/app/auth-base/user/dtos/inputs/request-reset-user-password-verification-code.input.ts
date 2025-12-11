import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { VerificationCodeStrategyEnum } from '../../enums/verification-code.strategy.enum';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';
import { Sms } from 'twilio/lib/twiml/VoiceResponse';

@ArgsType()
export class RequestResetUserPasswordVerificationCodeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  emailOrPhoneNumber: string;

  @Field(() => VerificationCodeStrategyEnum, { nullable: true })
  verificationCodeStrategy?: VerificationCodeStrategyEnum;

  @Field(() => SmsStrategyEnum, { defaultValue: SmsStrategyEnum.SMS })
  smsStrategy: SmsStrategyEnum;
}

import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';

@ArgsType()
export class RequestLoginWithPhoneNumberVerificationCodeInput {
  @Field()
  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @Field(() => SmsStrategyEnum, { defaultValue: SmsStrategyEnum.SMS })
  smsStrategy: SmsStrategyEnum;
}

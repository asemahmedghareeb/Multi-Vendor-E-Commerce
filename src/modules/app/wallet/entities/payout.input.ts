import { InputType, Field, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class PayoutInput {
  @Field()
  @IsUUID('4', { message: i18nValidationMessage('events.validation.IS_UUID') })
  vendorId: string;

  @Field(() => Float)
  @IsNumber({}, { message: i18nValidationMessage('events.validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('events.validation.MIN') })
  amount: number;
}

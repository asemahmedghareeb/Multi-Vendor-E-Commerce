import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';

@InputType()
export class UpdateCartItemInput {
  @Field()
  @IsUUID('4', { message: ValidationErrorMessageEnum.IS_UUID })
  cartItemId: string;

  @Field(() => Int)
  @IsInt({ message: ValidationErrorMessageEnum.IS_INT })
  @Min(1, { message: ValidationErrorMessageEnum.MIN })
  quantity: number;
}

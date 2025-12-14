import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';

@InputType()
export class RequestVendorInput {
  @Field()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  @IsNotEmpty({ message: ValidationErrorMessageEnum.NOT_EMPTY })
  @MinLength(3, { message: ValidationErrorMessageEnum.MIN })
  @MaxLength(50, { message: ValidationErrorMessageEnum.MAX })
  businessName: string;

  @Field()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  @IsNotEmpty({ message: ValidationErrorMessageEnum.NOT_EMPTY })
  @MinLength(20, { message: ValidationErrorMessageEnum.MIN })
  @MaxLength(500, { message: ValidationErrorMessageEnum.MAX })
  bio: string;
}

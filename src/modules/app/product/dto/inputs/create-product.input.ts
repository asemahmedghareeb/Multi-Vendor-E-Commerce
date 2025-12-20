import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  @IsNotEmpty({ message: ValidationErrorMessageEnum.NOT_EMPTY })
  name: string;

  @Field()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  @IsNotEmpty({ message: ValidationErrorMessageEnum.NOT_EMPTY })
  description: string;

  @Field(() => Float)
  @IsNumber(
    {},
    { message: ValidationErrorMessageEnum.IS_NUMBER },
  )
  @Min(0, { message: ValidationErrorMessageEnum.MIN })
  price: number;

  @Field(() => Int)
  @IsInt({ message: ValidationErrorMessageEnum.IS_INT })
  @Min(0, { message:ValidationErrorMessageEnum.MIN })
  inventoryCount: number;

  @Field(() => String)
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: ValidationErrorMessageEnum.IS_STRING })
  @Field(() => [String], { nullable: true })
  images?: string[];
}

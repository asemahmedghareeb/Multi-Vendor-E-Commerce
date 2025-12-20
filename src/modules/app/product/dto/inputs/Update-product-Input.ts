import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateProductInput } from './create-product.input';
import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  @IsUUID('4', { message: ValidationErrorMessageEnum.IS_UUID })
  @IsNotEmpty({ message: ValidationErrorMessageEnum.NOT_EMPTY })
  id: string;

  @Field(() => [String], { nullable: true })
  images?: string[];
}

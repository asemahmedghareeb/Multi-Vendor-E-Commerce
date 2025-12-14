import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';
@InputType()
export class GetProductsFilterInput extends PaginatorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  categoryName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ValidationErrorMessageEnum.IS_STRING })
  vendorName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0, { message: ValidationErrorMessageEnum.MIN })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0, { message: ValidationErrorMessageEnum.MAX })
  maxPrice?: number;
}

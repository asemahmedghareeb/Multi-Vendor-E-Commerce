import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsString, Min } from "class-validator";
import { ValidationErrorMessageEnum } from "src/common/enums/validation-error-message.enum";
import { MoneyScalar } from "src/common/scalars/money.scalar";

@InputType()
export class ProductFilterInput {
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

  @Field(() => MoneyScalar, { nullable: true })
  @IsOptional()
  @Min(0, { message: ValidationErrorMessageEnum.MIN })
  minPrice?: number;

  @Field(() => MoneyScalar, { nullable: true })
  @IsOptional()
  @Min(0, { message: ValidationErrorMessageEnum.MAX })
  maxPrice?: number;
}
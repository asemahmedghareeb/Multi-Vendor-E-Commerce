import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
@InputType()
export class GetProductsFilterInput extends PaginatorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  maxPrice?: number;
}

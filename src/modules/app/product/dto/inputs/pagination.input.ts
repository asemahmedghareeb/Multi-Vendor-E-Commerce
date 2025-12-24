import { Field, InputType } from '@nestjs/graphql';
import {
  NullablePaginatorArgsInput,
  PaginatorInput,
} from 'src/common/dtos/inputs/paginator.input';
import { ProductFilterInput } from './product-filter.input';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { extend } from 'string-format';
import { OrderBy } from './orderBy.input';

@InputType()
export class GetProductsFilterInput {
  @Field(() => ProductFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFilterInput)
  productFilter?: ProductFilterInput;
  
  @Field(() => PaginatorInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginatorInput)
  paginate?: PaginatorInput;
  
  @Field(() => OrderBy, { nullable: true })
  @IsOptional()
  @ValidateNested()
  orderBy?: OrderBy;
}

// @InputType()
// export class GetProductsFilterInput extends NullablePaginatorArgsInput {
//   @Field(() => ProductFilterInput, { nullable: true })
//   @IsOptional()
//   @ValidateNested()
//   @Type(() => ProductFilterInput)
//   productFilter?: ProductFilterInput;

// }

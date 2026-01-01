import { Field, InputType } from '@nestjs/graphql';
import {
  CursorPaginatorInput,
} from 'src/common/dtos/inputs/cursor-paginator.input';
import { ProductFilterInput } from './product-filter.input';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderBy } from './orderBy.input';

@InputType()
export class GetProductsCursorFilterInput {
  @Field(() => ProductFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFilterInput)
  productFilter?: ProductFilterInput;
  
  @Field(() => CursorPaginatorInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CursorPaginatorInput)
  paginate?: CursorPaginatorInput;

  @Field(() => OrderBy, { nullable: true })
  @IsOptional()
  @ValidateNested()
  orderBy?: OrderBy
  
}

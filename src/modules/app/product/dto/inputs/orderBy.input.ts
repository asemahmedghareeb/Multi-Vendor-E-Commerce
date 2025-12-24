import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProductSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PRICE = 'price',
  NAME = 'name',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

registerEnumType(ProductSortField, {
  name: 'ProductSortField',
});

@InputType()
export class OrderBy {
  @Field(() => ProductSortField, {
    nullable: true,
    defaultValue: ProductSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortField)
  field?: ProductSortField;

  @Field(() => SortOrder, { nullable: true, defaultValue: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}

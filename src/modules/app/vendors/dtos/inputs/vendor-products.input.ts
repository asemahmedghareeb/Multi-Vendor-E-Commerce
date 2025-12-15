import { InputType, Field } from '@nestjs/graphql';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

@InputType()
export class VendorProductsInput extends PaginatorInput {
  @Field(() => String, { nullable: true, description: 'Optional product name filter' })
  name?: string;
}

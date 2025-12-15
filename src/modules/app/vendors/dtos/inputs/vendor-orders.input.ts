import { InputType, Field } from '@nestjs/graphql';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

@InputType()
export class VendorOrdersInput extends PaginatorInput {
  @Field(() => String, { nullable: true, description: 'Optional order status filter' })
  status?: string;
}

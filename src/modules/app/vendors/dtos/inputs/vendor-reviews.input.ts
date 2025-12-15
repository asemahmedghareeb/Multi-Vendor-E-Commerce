import { InputType, Field, Int } from '@nestjs/graphql';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

@InputType()
export class VendorReviewsInput extends PaginatorInput {
  @Field(() => Int, { nullable: true, description: 'Optional rating filter (1-5)' })
  rating?: number;
}

import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { CreateReviewInput } from './create-review.input';


@InputType()
export class UpdateReviewInput extends PartialType(CreateReviewInput) {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;

}
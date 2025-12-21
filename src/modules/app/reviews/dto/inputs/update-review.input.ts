import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, Min, Max, IsUUID } from 'class-validator';

@InputType()
export class UpdateReviewInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(5)
  rating?: number;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
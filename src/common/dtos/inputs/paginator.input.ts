import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, Min, ValidateNested } from 'class-validator';

@InputType()
export class PaginatorInput {
  @Min(1)
  @Field(() => Int, { defaultValue: 1 })
  page?: number;

  @Min(1)
  @Field(() => Int, { defaultValue: 15 })
  limit?: number;
}

@ArgsType()
export class NullablePaginatorArgsInput {
  @Field({ nullable: true })
  @IsOptional()
  @ValidateNested()
  paginate?: PaginatorInput;
}
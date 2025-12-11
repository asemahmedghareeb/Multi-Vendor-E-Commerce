import { ArgsType, Field } from '@nestjs/graphql';
import { UsersActivityFilterInput } from './users-activity-filter.input';
import { IsOptional, ValidateNested } from 'class-validator';
import { UsersActivitySortbyInput } from './users-activity-sort-by.input';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';

@ArgsType()
export class AdminGetUsersActivityInput extends NullablePaginatorArgsInput {
  @Field(() => UsersActivityFilterInput, { nullable: true })
  @ValidateNested()
  @IsOptional()
  filter: UsersActivityFilterInput;

  @Field(() => UsersActivitySortbyInput, { nullable: true })
  @ValidateNested()
  @IsOptional()
  sortBy: UsersActivitySortbyInput;
}

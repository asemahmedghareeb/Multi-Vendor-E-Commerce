import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { SortDirectionEnum } from 'src/common/enums/sort-direction.enum';
import { UsersActivitySortByEnum } from '../../enums/users-activity-sort-by.enum';

@InputType()
export class UsersActivitySortbyInput {
  @Field(() => UsersActivitySortByEnum, { nullable: true })
  @IsOptional()
  sortBy?: UsersActivitySortByEnum;

  @Field(() => SortDirectionEnum, { nullable: true })
  @IsOptional()
  order?: SortDirectionEnum;
}

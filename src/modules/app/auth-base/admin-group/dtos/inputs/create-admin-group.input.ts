import { Field, InputType } from '@nestjs/graphql';
import { ArrayNotEmpty, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AdminGroupScopeEnum } from 'src/common/enums/admin-group-scope.enum';

@InputType()
export class CreateAdminGroupInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => AdminGroupScopeEnum)
  scope: AdminGroupScopeEnum;

  @Field(() => [String])
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissionsCodes: string[];
}

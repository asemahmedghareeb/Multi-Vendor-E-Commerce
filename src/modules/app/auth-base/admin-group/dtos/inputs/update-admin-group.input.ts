import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateAdminGroupInput } from './create-admin-group.input';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class updateAdminGroupInput extends PartialType(CreateAdminGroupInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

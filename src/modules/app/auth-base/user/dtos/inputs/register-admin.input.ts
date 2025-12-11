import { Field, InputType } from '@nestjs/graphql';
import { ManualRegisterWithPasswordInput } from '../../../auth/dtos/inputs/manual-register-user-with-password.input';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class RegisterAdminInput extends ManualRegisterWithPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  adminGroupId: string;
}

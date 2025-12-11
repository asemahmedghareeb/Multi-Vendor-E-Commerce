import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

@InputType()
export class ChangeUserPasswordInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  oldPassword: string;

  @IsString()
  @IsStrongPassword()
  @Field()
  newPassword: string;
}

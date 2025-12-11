import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { RegisterUserInput } from '../../../../../../common/dtos/inputs/register-user.input';

@InputType()
export class ManualRegisterWithPasswordInput extends RegisterUserInput {
  @Field({ nullable: true })
  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  password?: string;
}

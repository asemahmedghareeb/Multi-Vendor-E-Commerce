import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailInput {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

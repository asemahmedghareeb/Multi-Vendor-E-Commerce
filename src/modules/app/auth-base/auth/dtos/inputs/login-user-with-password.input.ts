import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { LoginDeviceInput } from 'src/common/dtos/inputs/login-device.input';

@InputType()
export class LoginUserWithPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  emailOrPhoneNumber: string;
 
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field(() => LoginDeviceInput)
  @ValidateNested()
  loginDeviceInput: LoginDeviceInput;
}

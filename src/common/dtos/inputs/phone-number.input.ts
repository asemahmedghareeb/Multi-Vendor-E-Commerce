import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class PhoneNumberInput {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

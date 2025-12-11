import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class GetUserLoginOptions {
  @Field()
  @IsString()
  @IsNotEmpty()
  emailOrPhoneNumber: string;
}

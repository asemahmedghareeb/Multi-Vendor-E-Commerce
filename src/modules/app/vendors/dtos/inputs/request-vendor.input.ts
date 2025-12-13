import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class RequestVendorInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  businessName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  bio: string;
}

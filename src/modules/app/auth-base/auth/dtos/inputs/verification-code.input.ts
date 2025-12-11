import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class VerificationCodeBaseInput {
  @Field()
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  @IsNumberString({ no_symbols: true })
  code: string;
}

@ArgsType()
export class VerificationCodeInput {
  @Field()
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  @IsNumberString({ no_symbols: true })
  code: string;
}

import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ENGLISH_CAPITAL_LITTERS_REGEX } from 'src/consts/regex/regex.const';

@ArgsType()
export class RegisterOperatingCountryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(ENGLISH_CAPITAL_LITTERS_REGEX, {
    message: 'Value Must be English UpperCase',
  })
  countryCode: string;
}

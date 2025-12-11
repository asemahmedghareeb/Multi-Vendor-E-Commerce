import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MATCHES,
} from 'class-validator';
import {
  ARABIC_LITTERS_REGEX,
  ENGLISH_LITTERS_REGEX,
} from 'src/consts/regex/regex.const';
import { CityStatusEnum } from '../../enums/city-status.enum';

@InputType()
export class CreateCityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(ARABIC_LITTERS_REGEX, {
    message: 'Only AR liters are allowed',
  })
  arName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(ENGLISH_LITTERS_REGEX, {
    message: 'Only EN liters are allowed',
  })
  enName: string;

  @Field(() => CityStatusEnum)
  status: CityStatusEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  countryId: string;
}

import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LangEnum } from 'src/common/enums/lang.enum';

@InputType()
export class UpdateUserInfo {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @IsOptional()
  @Field({ nullable: true })
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @IsOptional()
  @Field({ nullable: true })
  lastName?: string;

  @IsOptional()
  @Field(() => LangEnum, { nullable: true })
  favLang?: LangEnum;
}

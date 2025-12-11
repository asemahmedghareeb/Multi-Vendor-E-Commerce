import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  arName: string;
  
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  enName: string;
  
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;
}

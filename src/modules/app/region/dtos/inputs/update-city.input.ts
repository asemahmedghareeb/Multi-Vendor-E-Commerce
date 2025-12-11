import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateCityInput } from './create-city.input';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateCityInput extends PartialType(CreateCityInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

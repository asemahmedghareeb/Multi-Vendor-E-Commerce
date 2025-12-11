import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetCityInput {
  @Field()
  @IsString()
  @IsUUID()
  id: string;
}

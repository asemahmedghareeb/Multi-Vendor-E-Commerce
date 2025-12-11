import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class UnregisterOperatingCountry {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

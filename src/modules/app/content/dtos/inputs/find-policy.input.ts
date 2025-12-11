import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class FindPolicyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

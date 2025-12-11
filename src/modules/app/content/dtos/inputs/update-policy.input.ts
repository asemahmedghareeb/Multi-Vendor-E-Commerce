import { Args, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreatePolicyInput } from './create-policy.input';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdatePolicyInput extends PartialType(CreatePolicyInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

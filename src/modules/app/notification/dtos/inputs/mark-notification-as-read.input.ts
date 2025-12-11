import { Args, ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class markNotificationAsReadInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  notificationId: string;
}

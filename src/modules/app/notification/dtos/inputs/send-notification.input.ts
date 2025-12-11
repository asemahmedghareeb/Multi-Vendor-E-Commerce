import { Field, InputType } from '@nestjs/graphql';
import { NotificationMetadataInput } from './notification-metadata.input';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

@InputType()
export class SendNotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  enTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  arTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  enBody: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  arBody: string;

  @Field(() => NotificationMetadataInput)
  @ValidateNested()
  metadata: NotificationMetadataInput;

  @Field(() => Boolean)
  inAppOnly: boolean;

  @Field(() => [String])
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  receiverUserIds: string[];
}

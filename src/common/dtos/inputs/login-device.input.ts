import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeviceEnum } from 'src/common/enums/device.enum';
import { LangEnum } from 'src/common/enums/lang.enum';

@InputType()
export class LoginDeviceInput {
  @Field()
  @MaxLength(250)
  @IsNotEmpty()
  deviceName: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(250)
  @IsNotEmpty()
  @IsOptional()
  notificationToken?: string;

  @Field({ nullable: true })
  allowNotifications?: boolean;

  @Field(() => DeviceEnum)
  device: DeviceEnum;

  @Field(() => LangEnum, { nullable: true })
  deviceLang: LangEnum;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { AppContactsEnum } from '../../enums/app-contacts.enum';
import { Column } from 'typeorm';

@InputType()
export class SetAppContactInput {
  @Field(() => AppContactsEnum)
  type: AppContactsEnum;

  @Field()
  @IsString()
  @IsNotEmpty()
  target: string;
}

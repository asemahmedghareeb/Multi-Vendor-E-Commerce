import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LangEnum } from 'src/common/enums/lang.enum';

@InputType()
export class UpdateSessionInput {
  @Field(() => LangEnum, { nullable: true })
  lang?: LangEnum;

  @Field({ nullable: true })
  allowNotifications?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  notificationToken?: string;
}

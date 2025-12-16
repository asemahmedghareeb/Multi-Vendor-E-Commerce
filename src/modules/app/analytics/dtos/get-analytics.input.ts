import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class GetAnalyticsInput {
  @Field(() => Int, { defaultValue: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 5;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
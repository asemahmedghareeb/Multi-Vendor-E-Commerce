import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';

@InputType()
export class UsersActivityFilterInput {
  @Field(() => TimestampScalar, { nullable: true })
  minTime: Date;

  @Field(() => TimestampScalar, { nullable: true })
  maxTime: Date;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  userId: string;
}

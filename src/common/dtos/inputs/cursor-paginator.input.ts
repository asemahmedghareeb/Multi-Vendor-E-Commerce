import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';


@InputType()
export class CursorPaginatorInput {
  @Min(1)
  @Max(100)
  @Field(() => Int, { defaultValue: 15, nullable: true })
  first?: number;



  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  isForward?: boolean;
}

@ArgsType()
export class NullableSimpleCursorArgsInput {
  @Field({ nullable: true })
  @IsOptional()
  @ValidateNested()
  paginate?: CursorPaginatorInput;
}

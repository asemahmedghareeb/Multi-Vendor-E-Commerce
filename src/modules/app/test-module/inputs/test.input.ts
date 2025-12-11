import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';
import { ValidationErrorMessageEnum } from 'src/common/enums/validation-error-message.enum';

@InputType()
export class TestInput {
  @MaxLength(5, { message: ValidationErrorMessageEnum.TEST_INPUT_MAX_LENGTH })
  @Field()
  name: string;
}

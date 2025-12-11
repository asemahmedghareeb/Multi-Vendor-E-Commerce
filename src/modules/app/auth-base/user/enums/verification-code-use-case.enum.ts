import { registerEnumType } from '@nestjs/graphql';

export enum VerificationCodeUseCaseEnum {
  PASSWORD_RESET = 'PASSWORD_RESET',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_NUMBER_VERIFICATION = 'PHONE_NUMBER_VERIFICATION',
  UPDATE_PHONE_NUMBER = 'UPDATE_PHONE_NUMBER',
  LOG_IN_USER_WITH_EMAIL = 'LOG_IN_USER_WITH_EMAIL',
  LOG_IN_USER_WITH_PHONE_NUMBER = 'LOG_IN_USER_WITH_PHONE_NUMBER',
}

registerEnumType(VerificationCodeUseCaseEnum, {
  name: 'VerificationCodeUseCaseEnum',
});

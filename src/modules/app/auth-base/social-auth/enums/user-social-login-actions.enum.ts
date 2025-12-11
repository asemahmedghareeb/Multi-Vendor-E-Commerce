import { registerEnumType } from '@nestjs/graphql';

export enum UserSocialLoginActionsEnum {
  SOCIAL_REGISTER_USER = 'SOCIAL_REGISTER_USER',
  SOCIAL_LOGIN_USER = 'SOCIAL_LOGIN_USER',
  REGISTER_SOCIAL_ACCOUNT_FOR_EXISTING_USER = 'REGISTER_SOCIAL_ACCOUNT_FOR_EXISTING_USER',
  REPLACE_SOCIAL_ACCOUNT = 'REPLACE_SOCIAL_ACCOUNT',
}
registerEnumType(UserSocialLoginActionsEnum, {
  name: 'UserSocialLoginActionsEnum',
});

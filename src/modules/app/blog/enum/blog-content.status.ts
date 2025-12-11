import { registerEnumType } from '@nestjs/graphql';

export enum BlogContentStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(BlogContentStatusEnum, {
  name: 'BlogContentStatusEnum',
});

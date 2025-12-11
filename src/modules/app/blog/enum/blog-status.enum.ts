import { registerEnumType } from '@nestjs/graphql';

export enum BlogStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
registerEnumType(BlogStatusEnum, { name: 'BlogStatusEnum' });

import { registerEnumType } from '@nestjs/graphql';

export enum ContentStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(ContentStatusEnum, { name: 'ContentStatusEnum' });

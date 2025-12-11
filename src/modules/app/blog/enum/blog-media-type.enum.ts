import { registerEnumType } from '@nestjs/graphql';

export enum BlogMediaTypeEnum {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

registerEnumType(BlogMediaTypeEnum, {
  name: 'BlogMediaTypeEnum',
});

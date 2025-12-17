import { registerEnumType } from '@nestjs/graphql';

export enum FileModelEnum {
  PUBLIC_TEST = 'public_test',
  PRODUCT = 'product',
  
}

registerEnumType(FileModelEnum, {
  name: 'FileModelEnum',
});

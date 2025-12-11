import { registerEnumType } from '@nestjs/graphql';

export enum FileModelEnum {
  PUBLIC_TEST = 'public_test',
}

registerEnumType(FileModelEnum, {
  name: 'FileModelEnum',
});

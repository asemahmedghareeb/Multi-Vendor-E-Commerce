import { registerEnumType } from '@nestjs/graphql';

export enum DeviceEnum {
  DESKTOP = 'DESKTOP',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}
registerEnumType(DeviceEnum, { name: 'DeviceEnum' });

import { registerEnumType } from '@nestjs/graphql';

export enum CityStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(CityStatusEnum, {
  name: 'CityStatusEnum',
});

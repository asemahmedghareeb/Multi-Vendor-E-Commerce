import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { DeepPartial, FindOptionsWhere } from 'typeorm';

type $or<T extends AppBaseEntity> = FindOptionsWhere<T>[];

export type AppBaseEntityOr<T extends AppBaseEntity> = DeepPartial<T> & {
  $or: $or<T>;
};

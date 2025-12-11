import { Inject } from '@nestjs/common';
import { EntityTarget } from 'typeorm';

export function InjectAppRepository(
  entity: EntityTarget<any> & { name: string },
): ParameterDecorator {
  const repositoryToken = `${entity.name}Repository`;
  return (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    Inject(repositoryToken)(target, propertyKey, parameterIndex);
  };
}

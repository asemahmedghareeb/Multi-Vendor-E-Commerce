import { Injectable } from '@nestjs/common';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';

/**
 * Custom AppDataSource extends TypeORM DataSource and provides a method to get AppRepository for entities.
 * AppRepository adds custom methods for your application (see app.repository.ts).
 */
export class AppDataSource extends DataSource {
  // Map to cache custom AppRepository instances for each entity
  private appRepositories = new Map<EntityTarget<any>, AppRepository<any>>();

  constructor(options: DataSourceOptions) {
    super(options);
    // TypeORM Transactional library checks the constructor name to determine if this is a DataSource instance.
    // This Proxy ensures that 'constructor.name' returns 'DataSource', even though this is a subclass.
    // This is required for compatibility with typeorm-transactional.
    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'constructor') {
          return { name: 'DataSource' };
        }
        return Reflect.get(target, prop);
      },
    });
  }

  /**
   * Returns a custom AppRepository for the given entity.
   * If not already created, it instantiates and caches it.
   * AppRepository extends TypeORM's Repository and adds custom methods (see app.repository.ts).
   * @param target - The entity class or name.
   * @returns AppRepository instance for the entity.
   */
  getAppRepository<Entity extends AppBaseEntity>(
    target: EntityTarget<Entity>,
  ): AppRepository<Entity> {
    let repository = this.appRepositories.get(target);
    if (!repository) {
      // Create a new AppRepository for the entity, passing required TypeORM internals
      repository = new AppRepository(
        target,
        this.manager,
        this.manager.queryRunner,
      );
      this.appRepositories.set(target, repository);
    }
    return repository;
  }
}

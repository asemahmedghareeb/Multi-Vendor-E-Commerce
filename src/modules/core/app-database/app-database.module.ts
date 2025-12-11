import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { AppDataSource } from 'src/config/database/app.datasource';
import { dataSource } from 'src/config/database/typeorm.config';

/**
 * AppDatabaseModule
 *
 * Extends TypeOrmModule to provide custom AppRepository instances for entities.
 */
@Module({
  providers: [
    {
      provide: AppDataSource,
      useValue: dataSource, // use the same instance everywhere
    },
  ],
  exports: [AppDataSource],
})
export class AppDatabaseModule extends TypeOrmModule {
  /**
   * Registers custom AppRepository providers for the given entities.
   */
  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    // Create a provider for each entity, using its name as the injection token
    const providers = entities.map((entity) => {
      return {
        // The provider token will be e.g. 'UserRepository' for User entity
        provide: `${(entity as any).name}Repository`,
        // Factory returns the custom AppRepository for the entity
        useFactory: () => {
          return dataSource.getAppRepository(entity);
        },
      };
    });
    // Return a dynamic module with all providers and exports
    return {
      module: AppDatabaseModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}

// Import Node.js path utility for resolving entity file paths
import { join } from 'path';
// Import the custom AppDataSource (extends TypeORM DataSource)
import { AppDataSource } from './app.datasource';
// Import TypeORM's DataSourceOptions type
import { DataSourceOptions } from 'typeorm';
// Import dotenv to load environment variables from .env file
import { config } from 'dotenv';
import { get } from 'env-var';

// Load environment variables from .env (if present)
config(); // for migrations

export const TypeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: get('DB_HOST').required().asString(),
  port: get('DB_PORT').required().asIntPositive(),
  username: get('DB_USERNAME').required().asString(),
  password: get('DB_PASSWORD').required().asString(),
  database: get('DB_NAME').required().asString(),
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  subscribers: [],
  dropSchema: false,
  synchronize: true,
  migrationsRun: false,
  logging: false,
};

/**
 * The main AppDataSource instance for the application.
 *
 * This is used to access the database and to create custom AppRepository instances.
 * It is exported for use throughout the app (e.g., in AppDatabaseModule).
 */
export const dataSource = new AppDataSource(TypeOrmConfig);

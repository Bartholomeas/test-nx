import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { resolve } from 'node:path';

config({ path: resolve('apps/users2-backend/.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST']!,
  port: +(process.env['DB_PORT'] ?? 5432),
  username: process.env['DB_USERNAME']!,
  password: process.env['DB_PASSWORD']!,
  database: process.env['DB_NAME']!,
  logging: false,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: ['libs/database/src/lib/entities/**/*.entity.{ts,js}'],
  migrations: ['libs/database/src/lib/migrations/portal/**/*.{ts,js}'],
});

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Carica le variabili d'ambiente
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fanta_softair',
  entities: [join(__dirname, 'entities/*.entity.ts')],
  migrations: [join(__dirname, 'migrations/*.ts')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
  entities: ['src/**/*.entity{.js,.ts}'],
});

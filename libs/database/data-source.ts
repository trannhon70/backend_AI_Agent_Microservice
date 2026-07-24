import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
const isTs = __filename.endsWith('.ts');
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [
        join(__dirname, isTs ? 'src/entities/**/*.entity.ts' : 'dist/libs/database/entities/**/*.entity.js'),
    ],
    migrations: [
        join(__dirname, isTs ? 'src/migrations/**/*.ts' : 'dist/libs/database/migrations/**/*.js'),
    ],

    synchronize: false,
});
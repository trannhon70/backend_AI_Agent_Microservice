// libs/database/src/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function requireEnv(configService: ConfigService, key: string): string {
    const value = configService.get<string>(key);
    if (!value) throw new Error(`Missing required env var: ${key}`);
    return value;
}

export const getTypeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: requireEnv(configService, 'DB_HOST'),
    port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
    username: requireEnv(configService, 'DB_USERNAME'),
    password: requireEnv(configService, 'DB_PASSWORD'),
    database: requireEnv(configService, 'DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    autoLoadEntities: true,
    // logging: ['error', 'warn'],
});
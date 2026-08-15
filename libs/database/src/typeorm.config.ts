// libs/database/src/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Conversation } from './entities/conversation.entity';
import { Fanpage } from './entities/fanpage.entity';
import { Label } from './entities/label.entity';
import { LiveMessage } from './entities/live_message.entity';
import { PageToken } from './entities/page_token.entity';
import { UserPage } from './entities/user_page.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { QuickReplyCategory } from './entities/quick_reply_category.entity';
import { QuickReply } from './entities/quick_reply.entity';

const isTs = __filename.endsWith('.ts');

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
    entities: [
        Conversation, Fanpage, Label, LiveMessage, PageToken, QuickReply, QuickReplyCategory, Role, User, UserPage,
    ],
    migrations: [
        join(__dirname, isTs ? '../migrations/**/*.ts' : '../migrations/**/*.js'),
    ],
    synchronize: false,
    autoLoadEntities: true,
    // logging: ['error', 'warn'],
});
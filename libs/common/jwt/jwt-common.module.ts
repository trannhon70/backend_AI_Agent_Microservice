// libs/common/jwt/jwt-common.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { expiresIn } from '../utils';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'jhdksfjhdks854769',
            signOptions: { expiresIn: expiresIn },
        }),
    ],
    exports: [JwtModule],
})
export class JwtCommonModule { }
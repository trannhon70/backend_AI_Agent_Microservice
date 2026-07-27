import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

interface GrpcClientOptions {
    name: string;       // token dùng để @Inject, vd: 'auth'
    package: string;     // package trong file .proto, vd: 'auth'
    protoFile: string;   // tên file .proto, vd: 'auth.proto'
    urlEnvKey: string;   // tên biến env chứa url, vd: 'AUTH_GRPC_URL'
    defaultUrl?: string; // fallback nếu không có env
}

@Module({})
export class GrpcClientModule {
    static forFeature(options: GrpcClientOptions): DynamicModule {
        const protoPath = join(
            process.cwd(),
            `libs/proto/src/${options.protoFile}`,
        );
        console.log({
            name: options.name,
            protoPath,
            exists: require('fs').existsSync(protoPath),
        });
        return {
            module: GrpcClientModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name: options.name,
                        imports: [ConfigModule],
                        useFactory: (config: ConfigService) => ({
                            transport: Transport.GRPC,
                            options: {
                                package: options.package,
                                protoPath: join(process.cwd(), `libs/proto/src/${options.protoFile}`),
                                url: config.get<string>(options.urlEnvKey, options.defaultUrl ?? 'localhost:50051'),
                                loader: {
                                    keepCase: true,
                                    longs: Number,
                                },
                            },
                        }),
                        inject: [ConfigService],
                    },
                ]),
            ],
            exports: [ClientsModule],
        };
    }
}
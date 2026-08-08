// libs/redis/src/redis.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { EventEmitter } from 'events';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly redis: Redis;
    private readonly subscriber: Redis;

    public readonly expiredKeys$ = new EventEmitter();

    constructor(private readonly configService: ConfigService) {
        this.redis = new Redis(this.redisOptions);
        this.subscriber = new Redis(this.redisOptions);
        this.registerEvents();
    }

    private get redisOptions(): RedisOptions {
        return {
            host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
            port: parseInt(this.configService.get<string>('REDIS_PORT') ?? '6379', 10),
            password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        };
    }

    private redisConnectPromise: Promise<any> | null = null;
    private subscriberConnectPromise: Promise<any> | null = null;

    async onModuleInit() {
        // Dùng promise đã lưu (không chỉ dựa vào status) để chặn race condition
        // khi onModuleInit bị gọi gần như đồng thời nhiều lần trong hybrid app.
        if (!this.redisConnectPromise) {
            this.redisConnectPromise =
                this.redis.status === 'wait' || this.redis.status === 'end'
                    ? this.redis.connect()
                    : Promise.resolve();
        }
        await this.redisConnectPromise;

        if (!this.subscriberConnectPromise) {
            this.subscriberConnectPromise =
                this.subscriber.status === 'wait' || this.subscriber.status === 'end'
                    ? this.subscriber.connect().then(() => this.initKeyspaceListener())
                    : Promise.resolve();
        }
        await this.subscriberConnectPromise;
    }

    private registerEvents() {
        this.redis.on('connect', () => this.logger.log('✅ Redis connected'));
        this.redis.on('error', (err) => this.logger.error('❌ Redis error', err));
        this.subscriber.on('connect', () => this.logger.log('✅ Redis subscriber connected'));
        this.subscriber.on('error', (err) => this.logger.error('❌ Redis subscriber error', err));
    }

    private async initKeyspaceListener() {
        try {
            await this.subscriber.config('SET', 'notify-keyspace-events', 'Ex');
            await this.subscriber.subscribe('__keyevent@0__:expired');
            this.subscriber.on('message', (channel, key) => {
                if (channel !== '__keyevent@0__:expired') return;
                this.expiredKeys$.emit('expired', key);
            });
            this.logger.log('📡 Keyspace listener ready');
        } catch (err) {
            this.logger.error('❌ Keyspace listener error', err);
        }
    }

    async set(key: string, value: unknown, ttl?: number) {
        if (!ttl) this.logger.warn(`⚠️ Key ${key} set without TTL`);
        const data = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl) await this.redis.set(key, data, 'EX', ttl);
        else await this.redis.set(key, data);
    }

    async setNX(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
        const data = typeof value === 'string' ? value : JSON.stringify(value);
        const result = await this.redis.set(key, data, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async get<T = any>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        if (!data) return null;
        try { return JSON.parse(data); } catch { return data as unknown as T; }
    }

    async del(key: string) { await this.redis.del(key); }
    async ttl(key: string) { return this.redis.ttl(key); }

    async scan(pattern: string): Promise<string[]> {
        let cursor = '0';
        const keys: string[] = [];
        do {
            const [nextCursor, result] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            keys.push(...result);
        } while (cursor !== '0');
        return keys;
    }

    async delByPattern(pattern: string) {
        const keys = await this.scan(pattern);
        if (!keys.length) return;
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        this.logger.log(`🗑️ Deleted ${keys.length} keys with pattern: ${pattern}`);
    }

    async getMany<T = any>(pattern: string): Promise<Record<string, T>> {
        const keys = await this.scan(pattern);
        const result: Record<string, T> = {};
        if (!keys.length) return result;
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.get(key));
        const values = await pipeline.exec();
        values?.forEach((item, index) => {
            const value: any = item[1];
            if (!value) return;
            try { result[keys[index]] = JSON.parse(value); } catch { result[keys[index]] = value as unknown as T; }
        });
        return result;
    }

    // === PUB/SUB dùng cho socket-emitter giữa các service ===
    async publish(channel: string, message: unknown) {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        await this.redis.publish(channel, data);
    }

    private readonly subscribedChannels = new Set<string>();
    private readonly channelHandlers = new Map<string, Set<(message: string) => void>>();

    onChannelMessage(channel: string, handler: (message: string) => void) {
        if (!this.channelHandlers.has(channel)) this.channelHandlers.set(channel, new Set());
        this.channelHandlers.get(channel)!.add(handler);

        if (!this.subscribedChannels.has(channel)) {
            this.subscribedChannels.add(channel);
            this.subscriber.subscribe(channel);
            this.subscriber.on('message', (ch, message) => {
                if (ch !== channel) return;
                this.channelHandlers.get(channel)?.forEach((h) => h(message));
            });
        }
    }

    async ping() { return this.redis.ping(); }

    async onModuleDestroy() {
        this.logger.log('🔌 Closing Redis connections...');
        await this.redis.quit();
        await this.subscriber.quit();
    }
}
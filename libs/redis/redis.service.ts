// libs/redis/src/redis.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { EventEmitter } from 'events';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private redis!: Redis;
    private subscriber!: Redis;

    // Cho service khác lắng nghe expired key mà không cần biết Redis là gì
    public readonly expiredKeys$ = new EventEmitter();

    constructor(private readonly configService: ConfigService) { }

    private get redisOptions(): RedisOptions {
        return {
            host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
            port: parseInt(this.configService.get<string>('REDIS_PORT') ?? '6379', 10),
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        };
    }

    async onModuleInit() {
        this.redis = new Redis(this.redisOptions);
        this.subscriber = new Redis(this.redisOptions);
        this.registerEvents();
        await this.redis.connect();
        await this.subscriber.connect();
        await this.initKeyspaceListener();
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
                this.expiredKeys$.emit('expired', key); // chỉ emit, không biết gì về Kafka
            });

            this.logger.log('📡 Keyspace listener ready');
        } catch (err) {
            this.logger.error('❌ Keyspace listener error', err);
        }
    }

    // ...giữ nguyên get/set/del/scan/delByPattern/getMany/ping...
    // =========================
    // BASIC METHODS
    // =========================
    async set(key: string, value: unknown, ttl?: number) {
        if (!ttl) {
            this.logger.warn(`⚠️ Key ${key} set without TTL`);
        }

        const data = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttl) {
            await this.redis.set(key, data, 'EX', ttl);
        } else {
            await this.redis.set(key, data);
        }
    }

    async setNX(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
        const data = typeof value === 'string' ? value : JSON.stringify(value);
        const result = await this.redis.set(key, data, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async get<T = any>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch {
            return data as unknown as T;
        }
    }

    async del(key: string) {
        await this.redis.del(key);
    }

    async ttl(key: string) {
        return this.redis.ttl(key);
    }

    // =========================
    // SCAN (THAY KEYS)
    // =========================
    async scan(pattern: string): Promise<string[]> {
        let cursor = '0';
        const keys: string[] = [];

        do {
            const [nextCursor, result] = await this.redis.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100
            );

            cursor = nextCursor;
            keys.push(...result);
        } while (cursor !== '0');

        return keys;
    }

    // =========================
    // DELETE BY PATTERN (SAFE)
    // =========================
    async delByPattern(pattern: string) {
        const keys = await this.scan(pattern);

        if (!keys.length) return;

        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        this.logger.log(`🗑️ Deleted ${keys.length} keys with pattern: ${pattern}`);
    }

    // =========================
    // GET MANY (PIPELINE)
    // =========================
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

            try {
                result[keys[index]] = JSON.parse(value);
            } catch {
                result[keys[index]] = value as unknown as T;
            }
        });

        return result;
    }

    // =========================
    // HEALTH CHECK
    // =========================
    async ping() {
        return this.redis.ping();
    }

    async onModuleDestroy() {
        this.logger.log('🔌 Closing Redis connections...');
        await this.redis.quit();
        await this.subscriber.quit();
    }
}
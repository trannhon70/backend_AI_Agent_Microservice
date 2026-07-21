// src/common/client-ip.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';

export const ClientInfo = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): {
        ip: string;
        userAgent: string;
        browser?: string;
        os?: string;
        device?: string;
        location?: {
            country?: string;
            region?: string;
            city?: string;
            latitude?: number;
            longitude?: number;
        };
    } => {
        let ip: any;
        let userAgent: string | undefined;

        if (ctx.getType() === 'ws') {
            const client: Socket = ctx.switchToWs().getClient();
            userAgent = client.handshake.headers['user-agent'];
            const forwarded = client.handshake.headers['x-forwarded-for'];
            const rawIp = forwarded || client.handshake.address;
            ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;
        } else {
            const req = ctx.switchToHttp().getRequest();
            userAgent = req.headers['user-agent'];
            const forwarded = req.headers['x-forwarded-for'];
            const rawIp = typeof forwarded === 'string' ? forwarded : req.ip;
            ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;
        }

        const parser = new UAParser(userAgent || '');
        const uaResult = parser.getResult();

        // 🔍 Lấy vị trí địa lý bằng geoip-lite

        const geo = geoip.lookup(ip === '::ffff:172.19.0.1' ? '113.161.81.19' : ip);
        const location = geo
            ? {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                latitude: geo.ll?.[0],
                longitude: geo.ll?.[1],
            }
            : undefined;

        return {
            ip,
            userAgent: userAgent || '',
            browser: uaResult.browser.name || '',
            os: uaResult.os.name || '',
            device: uaResult.device.type || 'desktop',
            location,
        };
    },
);

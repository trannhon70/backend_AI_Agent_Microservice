// utils/encrypted-response.util.ts
import * as zlib from 'zlib';
import { Response } from 'express';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function sendEncryptedResponse(res: Response, data: any, secretKey: string = process.env.SECRET_KEY || 'a1s2d3f4@!#$%^&*'): void {
    const jsonStr = JSON.stringify(data);
    const compressed = zlib.deflateRawSync(jsonStr, { level: zlib.constants.Z_BEST_COMPRESSION });
    const encryptedBuffer = encryptToBuffer(compressed, secretKey);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(encryptedBuffer);
}

export function encryptToBuffer(data: Buffer, secretKey = 'a1s2d3f4@!#$%^&*'): Buffer {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return Buffer.concat([iv, encrypted]);
}
// utils/encrypted-response.util.ts
import * as zlib from 'zlib';
import { Response } from 'express';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function sendEncryptedResponse(res: Response, data: any, secretKey: string = process.env.SECRET_KEY || 'a1s2d3f4@!#$%^&*'): void {
    const jsonStr = JSON.stringify(data);
    const compressed = zlib.gzipSync(jsonStr);
    const encryptedBuffer = encryptToBuffer(compressed, secretKey);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(encryptedBuffer);
}

export function encryptToBuffer(text: any, secretKey = 'a1s2d3f4@!#$%^&*'): Buffer {
    // Key phải đúng 32 bytes cho aes-256, dùng hash để chuẩn hoá độ dài key bất kỳ
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16); // random IV mỗi lần mã hoá, tăng bảo mật

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // Ghép IV vào đầu buffer để lúc decrypt lấy lại đúng IV đã dùng
    return Buffer.concat([iv, encrypted]);
}
// utils/encrypted-response.util.ts
import * as zlib from 'zlib';
import { Response } from 'express';
import * as crypto from 'crypto';
import { encode } from '@msgpack/msgpack';

const ALGORITHM = 'aes-256-ctr';
const COMPRESS_THRESHOLD = 200; // bytes - dưới ngưỡng này nén không có lợi

// Format buffer cuối cùng: [1 byte flags][16 bytes IV][ciphertext]
// flags: bit 0 = 1 nếu có nén (deflateRaw), 0 nếu không nén
export function sendEncryptedResponse(res: Response, data: any, secretKey: string = process.env.SECRET_KEY || 'a1s2d3f4@!#$%^&*'): void {
    const packed = Buffer.from(encode(data)); // msgpack thay cho JSON.stringify

    let payload: Buffer;
    let compressed = false;

    if (packed.length > COMPRESS_THRESHOLD) {
        const deflated = zlib.deflateRawSync(packed, { level: zlib.constants.Z_BEST_COMPRESSION });
        // chỉ dùng bản nén nếu nó thực sự nhỏ hơn
        if (deflated.length < packed.length) {
            payload = deflated;
            compressed = true;
        } else {
            payload = packed;
        }
    } else {
        payload = packed;
    }

    const encryptedBuffer = encryptToBuffer(payload, compressed, secretKey);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(encryptedBuffer);
}

export function encryptToBuffer(data: Buffer, compressed: boolean, secretKey = 'a1s2d3f4@!#$%^&*'): Buffer {
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    const flags = Buffer.from([compressed ? 1 : 0]);

    return Buffer.concat([flags, iv, encrypted]);
}
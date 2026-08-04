// encrypt.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encryptResponse } from '../utils';

@Injectable()
export class EncryptInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => ({
                payload: encryptResponse(data, process.env.SECRET_KEY),
            })),
        );
    }
}
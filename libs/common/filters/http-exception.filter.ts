import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (res && typeof res === 'object') {
                const payload = res as any;

                if (Array.isArray(payload.message)) {
                    message = 'Validation failed';
                    errors = payload.message;
                } else if (typeof payload.message === 'string') {
                    message = payload.message;
                } else if (typeof payload.error === 'string') {
                    message = payload.error;
                }
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        } else if (typeof exception === 'string') {
            message = exception;
        }

        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
            message = 'Internal server error';
        }

        this.logger.error(
            `${request.method} ${request.url} -> ${status}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json({
            success: false,
            code: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            ...(errors ? { errors } : {}),
        });
    }
}
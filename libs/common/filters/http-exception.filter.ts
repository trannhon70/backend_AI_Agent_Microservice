import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { status as GrpcStatus } from '@grpc/grpc-js';

// Map gRPC status code -> HTTP status code
const grpcToHttpMap: Record<number, number> = {
    [GrpcStatus.CANCELLED]: 499,
    [GrpcStatus.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
    [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
    [GrpcStatus.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
    [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
    [GrpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [GrpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
    [GrpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
    [GrpcStatus.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
    [GrpcStatus.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
    [GrpcStatus.ABORTED]: HttpStatus.CONFLICT,
    [GrpcStatus.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
    [GrpcStatus.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
    [GrpcStatus.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
    [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
    [GrpcStatus.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
};

function isGrpcError(exception: unknown): exception is { code: number; message?: string; details?: string } {
    return (
        typeof exception === 'object' &&
        exception !== null &&
        typeof (exception as any).code === 'number' &&
        grpcToHttpMap[(exception as any).code] !== undefined
    );
}

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
        } else if (isGrpcError(exception)) {
            // Lỗi từ microservice (RpcException) đi qua gRPC
            status = grpcToHttpMap[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.details || exception.message || 'Internal server error';
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
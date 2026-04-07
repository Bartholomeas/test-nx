import type { Request } from 'express';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { ErrorResponseBody } from '../exceptions/app.exception';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const body = this.buildResponse(exception, request);

    if (body.statusCode >= 500) {
      this.logger.error(exception, `Unhandled exception on ${request.method} ${request.url}`);
    }

    response.status(body.statusCode).json(body);
  }

  private buildResponse(exception: unknown, request: Request): ErrorResponseBody {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const requestId = this.extractRequestId(request);

    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        timestamp,
        path,
        requestId,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as Record<string, unknown>)['message'] ?? exception.message);

      return {
        statusCode: status,
        code: HttpStatus[status] ?? 'UNKNOWN_ERROR',
        message: Array.isArray(message) ? message.join(', ') : String(message),
        timestamp,
        path,
        requestId,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
      path,
      requestId,
    };
  }

  private extractRequestId(request: Request): string | undefined {
    const header = request.headers['x-request-id'];

    if (Array.isArray(header)) {
      return header[0];
    }

    return header;
  }
}

import type { Request } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';

type RequestWithId = Request & { id?: string };

function getRequestId(request: RequestWithId): string | undefined {
  const headerValue = request.headers['x-request-id'];

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue ?? request.id;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const { method, url } = request;
    const requestId = getRequestId(request);
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          { requestId, method, url, durationMs: Date.now() - now },
          'Request handled',
        );
      }),
      catchError((err) => {
        this.logger.warn(
          { requestId, method, url, durationMs: Date.now() - now },
          'Request failed',
        );
        return throwError(() => err);
      }),
    );
  }
}

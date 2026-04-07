import { HttpException } from '@nestjs/common';

export interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  errors?: FieldError[];
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export abstract class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    readonly code: string,
    readonly fieldName?: string,
    readonly context?: Record<string, unknown>,
  ) {
    super({ message, code, fieldName, context }, statusCode);
  }
}

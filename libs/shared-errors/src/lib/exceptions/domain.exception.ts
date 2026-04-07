import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';

export class DomainException extends AppException {
  constructor(
    message: string,
    code: string,
    fieldName?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, fieldName, context);
  }
}

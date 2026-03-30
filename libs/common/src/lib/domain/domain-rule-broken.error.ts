import { BadRequestException } from '@nestjs/common';

export class DomainRuleBrokenError extends BadRequestException {
  constructor(
    message: string,
    readonly code: string,
    readonly fieldName?: string,
    readonly context?: Record<string, any>,
  ) {
    super({
      message,
      code,
      fieldName,
      context,
    });
  }
}

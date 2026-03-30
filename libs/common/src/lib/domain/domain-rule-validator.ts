import { Injectable } from '@nestjs/common';

import { DomainRule } from './domain-rule';
import { DomainRuleBrokenError } from './domain-rule-broken.error';

export interface DomainRuleError {
  code: string;
  message: string;
  context?: Record<string, any>;
}

@Injectable()
export class DomainRuleValidator {
  async validate(rules: DomainRule[]): Promise<void> {
    for (const rule of rules) {
      await rule.validate();
    }
  }

  async collect(rules: DomainRule[]): Promise<DomainRuleError[]> {
    const results = await Promise.allSettled(
      rules.map(async (rule) => {
        await rule.validate();
      }),
    );

    const errors: DomainRuleError[] = [];

    for (const result of results) {
      if (result.status === 'rejected') {
        const err = result.reason;

        if (err instanceof DomainRuleBrokenError) {
          errors.push({
            code: err.code,
            message: err.message,
            context: err?.context,
          });
          continue;
        }

        if (
          Array.isArray(err) &&
          err.every((e) => e instanceof DomainRuleBrokenError)
        ) {
          errors.push(
            ...err.map((e) => ({
              code: e.code,
              message: e.message,
              context: e?.context,
            })),
          );
          continue;
        }
        throw err;
      }
    }

    return errors;
  }
}

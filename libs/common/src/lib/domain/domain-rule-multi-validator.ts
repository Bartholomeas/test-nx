import { Injectable } from '@nestjs/common';

import { DomainRule } from './domain-rule';
import { DomainRuleBrokenError } from './domain-rule-broken.error';

@Injectable()
export class DomainRuleMultiValidator {
  async validate(rules: DomainRule[]): Promise<DomainRuleBrokenError[]> {
    const errors: DomainRuleBrokenError[] = [];

    for (const rule of rules) {
      try {
        await rule.validate();
      } catch (error) {
        if (error instanceof DomainRuleBrokenError) {
          errors.push(error);
        } else if (
          Array.isArray(error) &&
          error.length > 0 &&
          error[0] instanceof DomainRuleBrokenError
        ) {
          errors.push(...(error as DomainRuleBrokenError[]));
        } else {
          throw error;
        }
      }

      if (typeof (rule as any).getValidationErrors === 'function') {
        const ruleErrors = (rule as any).getValidationErrors();
        if (Array.isArray(ruleErrors)) {
          errors.push(...(ruleErrors as DomainRuleBrokenError[]));
        }
      }
    }

    return errors;
  }
}

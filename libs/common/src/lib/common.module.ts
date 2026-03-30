import { DomainRuleMultiValidator } from './domain/domain-rule-multi-validator';
import { DomainRuleValidator } from './domain/domain-rule-validator';

import { Global, Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [DomainRuleValidator, DomainRuleMultiValidator],
  exports: [DomainRuleValidator, DomainRuleMultiValidator],
})
@Global()
export class CommonModule {}

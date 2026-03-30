export interface DomainRule {
  validate: () => Promise<void>;
}

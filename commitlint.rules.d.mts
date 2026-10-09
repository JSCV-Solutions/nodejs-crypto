// Type declarations for the local commitlint plugin
// (commitlint.rules.mjs) so TypeScript sources and tests can import it
// with full types.
export interface CommitMessage {
  header: string | null;
  type: string | null;
  subject: string | null;
  body: string | null;
  footer: string | null;
}

export type RuleCondition = 'always' | 'never';

export type RuleOutcome = readonly [boolean] | readonly [boolean, string];

export type CommitRule = (
  parsed: CommitMessage,
  when?: RuleCondition
) => RuleOutcome;

export declare const rules: {
  readonly 'subject-capitalized': CommitRule;
  readonly 'subject-no-past-tense': CommitRule;
  readonly 'breaking-change-explained': CommitRule;
};

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { rules } from '../../commitlint.rules.mjs';
import type { CommitMessage, RuleOutcome } from '../../commitlint.rules.mjs';

function parsedMessage(
  subject: string | null,
  body: string | null = null,
  footer: string | null = null
): CommitMessage {
  const message: CommitMessage = {
    header: subject === null ? null : `FEATURE - ${subject}`,
    type: 'FEATURE',
    subject,
    body,
    footer
  };
  return message;
}

void describe('commitlint rules', (): void => {
  void describe('subject-capitalized', (): void => {
    void it('passes a description starting with a capital letter', (): void => {
      const outcome: RuleOutcome = rules['subject-capitalized'](
        parsedMessage('Add SHA-256 digest')
      );
      assert.equal(outcome[0], true);
    });

    void it('fails a description starting with a lowercase letter', (): void => {
      const outcome: RuleOutcome = rules['subject-capitalized'](
        parsedMessage('update readme')
      );
      assert.equal(outcome[0], false);
      assert.match(outcome[1] ?? '', /capital/);
    });

    void it('fails a description starting with a digit', (): void => {
      const outcome: RuleOutcome = rules['subject-capitalized'](
        parsedMessage('2-factor follow-up')
      );
      assert.equal(outcome[0], false);
    });

    void it('passes a missing subject and defers to subject-empty', (): void => {
      const outcome: RuleOutcome = rules['subject-capitalized'](
        parsedMessage(null)
      );
      assert.equal(outcome[0], true);
    });
  });

  void describe('subject-no-past-tense', (): void => {
    void it('passes an imperative first word', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Add SHA-256 digest')
      );
      assert.equal(outcome[0], true);
    });

    void it('fails a regular past-tense first word', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Fixed padding error')
      );
      assert.equal(outcome[0], false);
      assert.match(outcome[1] ?? '', /past tense/);
    });

    void it('fails another regular past-tense first word', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Added retry logic')
      );
      assert.equal(outcome[0], false);
    });

    void it('fails an irregular past-tense first word', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Wrote migration notes')
      );
      assert.equal(outcome[0], false);
    });

    void it('fails the irregular past tense of go', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Went back to polling')
      );
      assert.equal(outcome[0], false);
    });

    void it('passes an allowlisted imperative ending in ed', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Feed the entropy pool')
      );
      assert.equal(outcome[0], true);
    });

    void it('passes another allowlisted imperative ending in ed', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Seed the test fixtures')
      );
      assert.equal(outcome[0], true);
    });

    void it('passes a present-tense word ending in ge', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Merge the release notes')
      );
      assert.equal(outcome[0], true);
    });

    void it('checks only the first word', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage('Use the shared helper')
      );
      assert.equal(outcome[0], true);
    });

    void it('passes a missing subject and defers to subject-empty', (): void => {
      const outcome: RuleOutcome = rules['subject-no-past-tense'](
        parsedMessage(null)
      );
      assert.equal(outcome[0], true);
    });
  });

  void describe('breaking-change-explained', (): void => {
    void it('passes when no marker is present', (): void => {
      const outcome: RuleOutcome = rules['breaking-change-explained'](
        parsedMessage('Add SHA-256 digest', null, 'Close #12')
      );
      assert.equal(outcome[0], true);
    });

    void it('passes a marker followed by an explanation', (): void => {
      const outcome: RuleOutcome = rules['breaking-change-explained'](
        parsedMessage(
          'Lower default memory',
          'BREAKING CHANGE: Default Argon2id memory cost was lowered',
          null
        )
      );
      assert.equal(outcome[0], true);
    });

    void it('fails a marker without an explanation', (): void => {
      const outcome: RuleOutcome = rules['breaking-change-explained'](
        parsedMessage('Lower default memory', 'BREAKING CHANGE:', null)
      );
      assert.equal(outcome[0], false);
      assert.match(outcome[1] ?? '', /BREAKING CHANGE/);
    });

    void it('fails a marker followed only by whitespace', (): void => {
      const outcome: RuleOutcome = rules['breaking-change-explained'](
        parsedMessage('Lower default memory', 'BREAKING CHANGE:   ', null)
      );
      assert.equal(outcome[0], false);
    });

    void it('finds the marker in the footer', (): void => {
      const outcome: RuleOutcome = rules['breaking-change-explained'](
        parsedMessage('Lower default memory', null, 'BREAKING CHANGE:')
      );
      assert.equal(outcome[0], false);
    });
  });
});

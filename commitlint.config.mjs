// commitlint configuration enforcing the `<TYPE> - <Description>` commit
// format required by the `commit-conventions` capability
// (openspec/changes/add-commit-conventions). The custom rules live in the
// local commitlint.rules.mjs plugin, registered inline because commitlint
// only resolves string plugin entries as packages. See CONTRIBUTING.md and
// AGENTS.md.
import { rules } from './commitlint.rules.mjs';

export default {
  parserPreset: {
    parserOpts: {
      // (\S+) instead of ([A-Z]+) so mistyped or lowercase types still
      // parse and are reported by type-enum (which lists the allowed
      // types) and type-case. With ([A-Z]+) a header such as
      // `feat - ...` yields a null type that the built-in rules pass
      // vacuously. Headers with no ` - ` separator at all still yield
      // null and are caught by type-empty and subject-empty below.
      headerPattern: /^(\S+) - (.+)$/,
      headerCorrespondence: ['type', 'subject']
    }
  },
  plugins: [{ rules }],
  ignores: [commit => commit.startsWith('Merge ')],
  rules: {
    'breaking-change-explained': [2, 'always'],
    'subject-capitalized': [2, 'always'],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 50],
    'subject-no-past-tense': [2, 'always'],
    'type-case': [2, 'always', 'upper-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'CHORE',
        'DOCS',
        'ENHANCEMENT',
        'FEATURE',
        'FIX',
        'GITIGNORE',
        'HOTFIX',
        'MERGE',
        'REFACTOR',
        'SECURITY',
        'STYLE',
        'TEST'
      ]
    ]
  }
};

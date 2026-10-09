// Local commitlint plugin implementing the project-specific commit message
// rules required by the `commit-conventions` capability
// (openspec/changes/add-commit-conventions). Loaded through the `plugins`
// entry of commitlint.config.mjs.
const pastTenseAllowlist = new Set([
  'embed',
  'exceed',
  'feed',
  'need',
  'proceed',
  'seed',
  'speed',
  'succeed'
]);

// Common irregular simple-past forms. The past-tense rule is a heuristic
// that only inspects the first word of the description, so this list is
// intentionally limited to frequent verbs and can grow when contributors
// report false negatives.
const irregularPastTense = new Set([
  'arose',
  'ate',
  'awoke',
  'became',
  'began',
  'bent',
  'bit',
  'bled',
  'blew',
  'bore',
  'bought',
  'bound',
  'broke',
  'brought',
  'built',
  'burst',
  'came',
  'cast',
  'caught',
  'chose',
  'clung',
  'cost',
  'crept',
  'cut',
  'dealt',
  'did',
  'drank',
  'dreamt',
  'drew',
  'drove',
  'dwelt',
  'fell',
  'felt',
  'fought',
  'fled',
  'flew',
  'flung',
  'forbade',
  'forgot',
  'forgave',
  'froze',
  'gave',
  'got',
  'went',
  'ground',
  'grew',
  'had',
  'heard',
  'held',
  'hid',
  'hit',
  'hung',
  'hurt',
  'kept',
  'knelt',
  'knew',
  'laid',
  'led',
  'leapt',
  'learnt',
  'left',
  'lent',
  'lit',
  'lost',
  'made',
  'meant',
  'met',
  'paid',
  'put',
  'quit',
  'ran',
  'rang',
  'read',
  'rode',
  'rose',
  'said',
  'sang',
  'sank',
  'sat',
  'saw',
  'sent',
  'set',
  'shook',
  'shot',
  'showed',
  'shrank',
  'shut',
  'slept',
  'slid',
  'slung',
  'sold',
  'sought',
  'spoke',
  'spent',
  'spilt',
  'spoilt',
  'spread',
  'sprang',
  'stood',
  'stole',
  'struck',
  'stuck',
  'stung',
  'strove',
  'swam',
  'swore',
  'swept',
  'swelled',
  'swung',
  'taught',
  'told',
  'thought',
  'threw',
  'tore',
  'took',
  'trod',
  'woke',
  'won',
  'wore',
  'wound',
  'withdrew',
  'wrote',
  'wrung'
]);

function isNegated(when) {
  return when === 'never';
}

function subjectCapitalized(parsed, when) {
  const subject = parsed.subject || '';
  if (subject === '') {
    return [true];
  }
  const pass = /^[A-Z]/.test(subject) !== isNegated(when);
  return pass
    ? [true]
    : [false, 'description must start with a capital letter'];
}

function subjectNoPastTense(parsed, when) {
  const subject = parsed.subject || '';
  const first = subject.trim().split(/\s+/)[0] || '';
  const word = first.toLowerCase();
  if (word === '' || pastTenseAllowlist.has(word)) {
    return [true];
  }
  const past = word.endsWith('ed') || irregularPastTense.has(word);
  const pass = past === isNegated(when);
  return pass
    ? [true]
    : [
        false,
        'description must not start with a verb in the past tense, ' +
          'use the imperative form instead'
      ];
}

function breakingChangeExplained(parsed, when) {
  const negate = isNegated(when);
  const text = (parsed.body || '') + '\n' + (parsed.footer || '');
  const marker = 'BREAKING CHANGE:';
  if (text.includes(marker) === false) {
    return [true];
  }
  const explained = text
    .split(marker)
    .slice(1)
    .every(section => section.trim() !== '');
  const pass = explained !== negate;
  return pass
    ? [true]
    : [false, 'BREAKING CHANGE: must be followed by an explanation'];
}

export const rules = {
  'subject-capitalized': subjectCapitalized,
  'subject-no-past-tense': subjectNoPastTense,
  'breaking-change-explained': breakingChangeExplained
};

/**
 * Publish-tag selection for the release workflow (task 3.5).
 * Decides which npm dist-tag a version is published under: `latest` only
 * when the version is higher than every stable version already published,
 * otherwise the broadest version-line tag it still qualifies for
 * (`latest-<major>` or `latest-<major>.<minor>`), and fails before
 * publishing when the version is lower than one already published in its
 * major.minor line. Pre-releases are published under the first pre-release
 * identifier (for example `beta`). An empty published-version list (the
 * package was never published) counts as highest, so the first stable
 * release takes `latest`.
 * Usage: node scripts/select-publish-tag.mjs --version <version>
 *   [--package <name>] [--published-json <json>] [--registry <url>]
 * With --published-json the registry is not contacted (used to verify the
 * task 3.6 cases locally). Otherwise the published versions are read with
 * `npm view <package> versions --json`; a not-found response means the
 * package was never published and yields an empty list. Any other registry
 * failure fails the command before anything is published.
 * On success the `publish-tag`, `extra-tags` and `prerelease` values are
 * printed as `GITHUB_OUTPUT` lines and echoed for local runs.
 */
import { execFile } from 'node:child_process';

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= process.argv.length) {
    return undefined;
  }
  return process.argv[index + 1];
}

export function parseVersion(text) {
  const clean = text.startsWith('v') ? text.slice(1) : text;
  const hyphen = clean.indexOf('-');
  const core = hyphen === -1 ? clean : clean.slice(0, hyphen);
  const prerelease = hyphen === -1 ? null : clean.slice(hyphen + 1);
  const parts = core.split('.');
  if (parts.length !== 3 || prerelease === '') {
    return null;
  }
  const numbers = parts.map(part =>
    /^(0|[1-9][0-9]*)$/.test(part) ? Number(part) : NaN
  );
  if (numbers.some(n => Number.isNaN(n))) {
    return null;
  }
  return {
    major: numbers[0],
    minor: numbers[1],
    patch: numbers[2],
    prerelease
  };
}

export function compareVersions(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

export function selectPublishTag(newVersionText, published) {
  const next = parseVersion(newVersionText);
  if (next === null) {
    throw new Error(`Invalid version: ${newVersionText}`);
  }
  if (next.prerelease !== null) {
    const first = next.prerelease.split('.')[0];
    if (
      first === '' ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(first) ||
      /^[0-9]+$/.test(first)
    ) {
      throw new Error(`Invalid pre-release dist-tag: ${first}`);
    }
    return { publishTag: first, extraTags: [], prerelease: true };
  }
  const stable = [];
  for (const entry of published) {
    const parsed = typeof entry === 'string' ? parseVersion(entry) : null;
    if (parsed !== null && parsed.prerelease === null) {
      stable.push(parsed);
    }
  }
  const sameMajor = stable.filter(v => v.major === next.major);
  const sameMinor = sameMajor.filter(v => v.minor === next.minor);
  const highest = list =>
    list.reduce(
      (a, b) => (a === undefined || compareVersions(a, b) < 0 ? b : a),
      undefined
    );
  const topAll = highest(stable);
  const topMajor = highest(sameMajor);
  const topMinor = highest(sameMinor);
  const isHigher = top => top === undefined || compareVersions(next, top) > 0;
  const majorTag = `latest-${next.major}`;
  const minorTag = `latest-${next.major}.${next.minor}`;
  if (isHigher(topAll)) {
    return {
      publishTag: 'latest',
      extraTags: [majorTag, minorTag],
      prerelease: false
    };
  }
  if (isHigher(topMajor)) {
    return { publishTag: majorTag, extraTags: [minorTag], prerelease: false };
  }
  if (isHigher(topMinor)) {
    return { publishTag: minorTag, extraTags: [], prerelease: false };
  }
  throw new Error(
    `Version ${newVersionText} is not higher than the published ` +
      `${next.major}.${next.minor}.x line; refusing to publish`
  );
}

function fetchPublishedVersions(packageName, registry) {
  return new Promise((resolve, reject) => {
    const args = [
      'view',
      packageName,
      'versions',
      '--json',
      `--registry=${registry}`
    ];
    execFile('npm', args, (error, stdout, stderr) => {
      if (error !== null) {
        const output = `${stdout}${stderr}`;
        if (/E404|404 Not Found/.test(output)) {
          resolve([]);
          return;
        }
        reject(new Error(`npm view failed: ${output.trim()}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(typeof parsed === 'string' ? [parsed] : parsed);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

try {
  const version = readArg('version');
  if (version === undefined) {
    throw new Error('Missing required --version <version>');
  }
  const packageName = readArg('package') ?? '@jscv-solutions/node-crypto';
  const registry = readArg('registry') ?? 'https://registry.npmjs.org/';
  const inline = readArg('published-json');
  const published =
    inline !== undefined
      ? JSON.parse(inline)
      : await fetchPublishedVersions(packageName, registry);
  if (!Array.isArray(published)) {
    throw new Error('Published versions must be a JSON array');
  }
  const selection = selectPublishTag(version, published);
  console.log(`publish-tag=${selection.publishTag}`);
  console.log(`extra-tags=${selection.extraTags.join(' ')}`);
  console.log(`prerelease=${selection.prerelease}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

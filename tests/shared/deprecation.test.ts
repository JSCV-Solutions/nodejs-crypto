import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import {
  deprecationCodeFor,
  emitDeprecationWarning
} from '../../src/shared/deprecation.ts';

void describe('shared deprecation', (): void => {
  void it('derives a stable warning code from the identifier', (): void => {
    assert.equal(deprecationCodeFor('md5'), 'NODE_CRYPTO_DEPRECATED_MD5');
    assert.equal(
      deprecationCodeFor('aes-256-gcm'),
      'NODE_CRYPTO_DEPRECATED_AES_256_GCM'
    );
  });

  void it('emits exactly one process warning per algorithm', async (): Promise<void> => {
    const seen: Error[] = [];
    const listener: (warning: Error) => void = (warning: Error): void => {
      seen.push(warning);
    };
    process.on('warning', listener);
    try {
      emitDeprecationWarning('test-deprecation-once');
      emitDeprecationWarning('test-deprecation-once');
      await setImmediate();
    } finally {
      process.removeListener('warning', listener);
    }
    assert.equal(seen.length, 1);
    const warning: Error & { code?: unknown } = seen[0] as Error & {
      code?: unknown;
    };
    assert.equal(warning.code, 'NODE_CRYPTO_DEPRECATED_TEST_DEPRECATION_ONCE');
    assert.match(warning.message, /test-deprecation-once/);
    assert.match(warning.message, /deprecated/);
  });

  void it('warns independently for different algorithms', async (): Promise<void> => {
    const seen: Error[] = [];
    const listener: (warning: Error) => void = (warning: Error): void => {
      seen.push(warning);
    };
    process.on('warning', listener);
    try {
      emitDeprecationWarning('test-deprecation-alpha');
      emitDeprecationWarning('test-deprecation-beta');
      await setImmediate();
    } finally {
      process.removeListener('warning', listener);
    }
    assert.equal(seen.length, 2);
  });
});

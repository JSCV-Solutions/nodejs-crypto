import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { bytes, bytesSync } from '../../src/packages/random/bytes.ts';
import { decodeText } from '../../src/shared/encodings.ts';
import { NodeCryptoError } from '../../src/shared/errors.ts';
import type { Encoding } from '../../src/shared/typings/encodings.js';

const lengths: number[] = [0, 1, 16, 64];

function assertInvalidArgument(error: unknown): boolean {
  assert.equal(error instanceof NodeCryptoError, true);
  assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
  return true;
}

void describe('random bytes', (): void => {
  void it('returns Buffers of the requested length that differ', async (): Promise<void> => {
    for (const length of lengths) {
      const first: Buffer = await bytes(length);
      const second: Buffer = await bytes(length);
      assert.equal(Buffer.isBuffer(first), true);
      assert.equal(first.length, length);
      if (length > 0) {
        assert.equal(first.equals(second), false);
      }
    }
  });

  void it('returns Buffers from the sync variant with matching shapes', (): void => {
    for (const length of lengths) {
      const value: Buffer = bytesSync(length);
      assert.equal(Buffer.isBuffer(value), true);
      assert.equal(value.length, length);
    }
  });

  void it('renders hex, base64 and base64url text that decodes back', async (): Promise<void> => {
    const encodings: Encoding[] = ['hex', 'base64', 'base64url'];
    for (const encoding of encodings) {
      const text: string = await bytes(16, encoding);
      assert.equal(typeof text, 'string');
      assert.equal(decodeText(text, encoding).length, 16);
      const syncText: string = bytesSync(16, encoding);
      assert.equal(decodeText(syncText, encoding).length, 16);
    }
  });

  void it('renders 16 bytes as 32 lowercase hex characters', async (): Promise<void> => {
    const text: string = await bytes(16, 'hex');
    assert.equal(text.length, 32);
    assert.match(text, /^[0-9a-f]{32}$/);
  });

  void it('rejects bad lengths with INVALID_ARGUMENT in both variants', async (): Promise<void> => {
    const bad: unknown[] = [-1, 1.5, NaN, Infinity, '16', null, undefined];
    for (const length of bad) {
      await assert.rejects(bytes(length as number), assertInvalidArgument);
      assert.throws((): void => {
        bytesSync(length as number);
      }, assertInvalidArgument);
    }
  });

  void it('rejects unsupported encodings with INVALID_ARGUMENT in both variants', async (): Promise<void> => {
    await assert.rejects(
      bytes(16, 'utf8' as unknown as Encoding),
      assertInvalidArgument
    );
    assert.throws((): void => {
      bytesSync(16, 'utf8' as unknown as Encoding);
    }, assertInvalidArgument);
  });

  void it('throws equal codes from async and sync variants', async (): Promise<void> => {
    await assert.rejects(bytes(-1), (error: unknown): boolean => {
      assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
      return true;
    });
    assert.throws(
      (): void => {
        bytesSync(-1);
      },
      (error: unknown): boolean => {
        assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
        return true;
      }
    );
  });

  void it('never echoes bytes in the error message', (): void => {
    try {
      bytesSync(-1);
      assert.fail('bytesSync should have thrown');
    } catch (error: unknown) {
      assert.equal(error instanceof NodeCryptoError, true);
      assert.equal((error as NodeCryptoError).message.includes('-1'), false);
    }
  });

  void it('does not depend on Math.random', async (): Promise<void> => {
    // eslint-disable-next-line no-restricted-properties -- reading the insecure generator to save and restore it around the stub.
    const original: () => number = Math.random;
    // eslint-disable-next-line no-restricted-properties -- stubbing the insecure generator proves the CSPRNG is the only source.
    Math.random = (): number => 0.5;
    try {
      const first: Buffer = await bytes(16);
      const second: Buffer = await bytes(16);
      assert.equal(first.equals(second), false);
    } finally {
      // eslint-disable-next-line no-restricted-properties -- restores the stubbed generator after the test.
      Math.random = original;
    }
  });
});

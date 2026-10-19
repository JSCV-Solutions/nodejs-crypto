import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { integer, integerSync } from '../../src/packages/random/integer.ts';
import { NodeCryptoError } from '../../src/shared/errors.ts';
import type { IntegerOptions } from '../../src/packages/random/typings/integer.js';

function assertInvalidArgument(error: unknown): boolean {
  assert.equal(error instanceof NodeCryptoError, true);
  assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
  return true;
}

void describe('random integer', (): void => {
  void it('returns integers inside [min, max)', async (): Promise<void> => {
    for (let round: number = 0; round < 50; round = round + 1) {
      const value: number = await integer({ min: 1, max: 7 });
      assert.equal(Number.isInteger(value), true);
      assert.equal(value >= 1 && value < 7, true);
    }
  });

  void it('returns integers inside [min, max) from the sync variant', (): void => {
    for (let round: number = 0; round < 50; round = round + 1) {
      const value: number = integerSync({ min: -5, max: 5 });
      assert.equal(value >= -5 && value < 5, true);
    }
  });

  void it('defaults min to 0 when only max is given', async (): Promise<void> => {
    for (let round: number = 0; round < 25; round = round + 1) {
      const value: number = await integer({ max: 10 });
      assert.equal(value >= 0 && value < 10, true);
      const syncValue: number = integerSync({ max: 10 });
      assert.equal(syncValue >= 0 && syncValue < 10, true);
    }
  });

  void it('rejects empty or unsafe ranges with INVALID_ARGUMENT in both variants', async (): Promise<void> => {
    const bad: unknown[] = [
      { min: 5, max: 5 },
      { min: 7, max: 1 },
      {},
      { max: 10, min: 10 },
      { min: 1.5, max: 7 },
      { min: 1, max: Number.NaN },
      { min: Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER + 2 },
      { min: '1', max: 7 },
      null,
      5
    ];
    for (const options of bad) {
      await assert.rejects(
        integer(options as IntegerOptions),
        assertInvalidArgument
      );
      assert.throws((): void => {
        integerSync(options as IntegerOptions);
      }, assertInvalidArgument);
    }
  });

  void it('throws equal codes from async and sync variants', async (): Promise<void> => {
    await assert.rejects(
      integer({ min: 3, max: 3 }),
      (error: unknown): boolean => {
        assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
        return true;
      }
    );
    assert.throws(
      (): void => {
        integerSync({ min: 3, max: 3 });
      },
      (error: unknown): boolean => {
        assert.equal((error as NodeCryptoError).code, 'INVALID_ARGUMENT');
        return true;
      }
    );
  });

  void it('does not depend on Math.random', async (): Promise<void> => {
    // eslint-disable-next-line no-restricted-properties -- reading the insecure generator to save and restore it around the stub.
    const original: () => number = Math.random;
    // eslint-disable-next-line no-restricted-properties -- stubbing the insecure generator proves the CSPRNG is the only source.
    Math.random = (): number => 0.5;
    try {
      const seen: Set<number> = new Set<number>();
      for (let round: number = 0; round < 20; round = round + 1) {
        const value: number = await integer({ max: 1000 });
        seen.add(value);
      }
      assert.equal(seen.size > 1, true);
    } finally {
      // eslint-disable-next-line no-restricted-properties -- restores the stubbed generator after the test.
      Math.random = original;
    }
  });
});

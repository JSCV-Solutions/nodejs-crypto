import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { InvalidArgumentError } from '../../src/shared/errors.ts';
import { UnsupportedAlgorithmError } from '../../src/shared/errors.ts';
import { hash, hashSync } from '../../src/packages/digest/index.ts';
import type { DigestAlgorithm } from '../../src/packages/digest/typings/digest.js';
import type { CryptoInput } from '../../src/shared/typings/inputs.js';
import type { Encoding } from '../../src/shared/typings/encodings.js';

void describe('digest hash', (): void => {
  const algorithms: DigestAlgorithm[] = ['md5', 'sha-256', 'sha-512'];

  void it('returns a Buffer by default and throws UNSUPPORTED (not implemented yet)', (): void => {
    for (const algorithm of algorithms) {
      assert.throws(
        (): void => {
          hashSync(algorithm, 'abc');
        },
        (error: unknown): boolean => {
          assert.equal(error instanceof UnsupportedAlgorithmError, true);
          assert.equal(
            (error as UnsupportedAlgorithmError).code,
            'UNSUPPORTED_ALGORITHM'
          );
          return true;
        }
      );
    }
  });

  void it('accepts every supported encoding before reaching the dispatch (throws UNSUPPORTED, not INVALID_ARGUMENT)', (): void => {
    const encodings: Encoding[] = ['hex', 'base64', 'base64url'];
    for (const algorithm of algorithms) {
      for (const encoding of encodings) {
        assert.throws(
          (): void => {
            hashSync(algorithm, 'abc', encoding);
          },
          (error: unknown): boolean => {
            assert.equal(error instanceof UnsupportedAlgorithmError, true);
            return true;
          }
        );
      }
    }
  });

  void it('throws INVALID_ARGUMENT for an unsupported encoding', (): void => {
    assert.throws(
      (): void => {
        hashSync('sha-256', 'abc', 'rot13' as never);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        assert.equal((error as InvalidArgumentError).code, 'INVALID_ARGUMENT');
        return true;
      }
    );
  });

  void it('throws INVALID_ARGUMENT for non-CryptoInput data', (): void => {
    const badValues: unknown[] = [123, null, undefined, { x: 1 }, true];
    for (const value of badValues) {
      assert.throws(
        (): void => {
          hashSync('sha-256', value as never);
        },
        (error: unknown): boolean => {
          assert.equal(error instanceof InvalidArgumentError, true);
          assert.equal(
            (error as InvalidArgumentError).code,
            'INVALID_ARGUMENT'
          );
          return true;
        }
      );
    }
  });

  void it('throws UNSUPPORTED_ALGORITHM for unknown algorithm identifiers', (): void => {
    assert.throws(
      (): void => {
        hashSync('rot13' as never, 'abc');
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof UnsupportedAlgorithmError, true);
        assert.equal(
          (error as UnsupportedAlgorithmError).code,
          'UNSUPPORTED_ALGORITHM'
        );
        return true;
      }
    );
  });

  void it('accepts equivalent input containers (passes validation, reaches UNSUPPORTED)', (): void => {
    const text: string = 'hello';
    const buffer: Buffer = Buffer.from(text, 'utf8');
    const view: Uint8Array = new Uint8Array(buffer);
    for (const input of [text, buffer, view] as CryptoInput[]) {
      assert.throws(
        (): void => {
          hashSync('sha-256', input);
        },
        (error: unknown): boolean => {
          assert.equal(error instanceof UnsupportedAlgorithmError, true);
          return true;
        }
      );
    }
  });

  void it('accepts multibyte UTF-8 input (passes validation, reaches UNSUPPORTED)', (): void => {
    assert.throws(
      (): void => {
        hashSync('sha-256', 'héllo');
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof UnsupportedAlgorithmError, true);
        return true;
      }
    );
  });

  void it('keeps error messages free of data and digests', (): void => {
    try {
      hashSync('sha-256', 123 as never);
      assert.fail('expected throw');
    } catch (error: unknown) {
      const message: string = (error as Error).message;
      assert.equal(message.includes('123'), false);
    }
    try {
      hashSync('rot13' as never, 'abc');
      assert.fail('expected throw');
    } catch (error: unknown) {
      const message: string = (error as Error).message;
      assert.equal(message.includes('abc'), false);
    }
  });

  void it('keeps async and sync error parity', async (): Promise<void> => {
    await assert.rejects(
      hash('rot13' as never, 'abc'),
      (error: unknown): boolean => {
        assert.equal(error instanceof UnsupportedAlgorithmError, true);
        return true;
      }
    );
    await assert.rejects(
      hash('sha-256', 123 as never),
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        return true;
      }
    );
    await assert.rejects(
      hash('sha-256', 'abc', 'rot13' as never),
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        return true;
      }
    );
    assert.throws(
      (): void => {
        hashSync('rot13' as never, 'abc');
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof UnsupportedAlgorithmError, true);
        return true;
      }
    );
    assert.throws(
      (): void => {
        hashSync('sha-256', 123 as never);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        return true;
      }
    );
    assert.throws(
      (): void => {
        hashSync('sha-256', 'abc', 'rot13' as never);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        return true;
      }
    );
  });
});

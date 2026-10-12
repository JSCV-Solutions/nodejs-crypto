import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { assertSupportedAlgorithm } from '../../src/shared/algorithms.ts';
import { UnsupportedAlgorithmError } from '../../src/shared/errors.ts';

const supported: readonly string[] = ['sha-256', 'sha-512'];

void describe('assertSupportedAlgorithm', (): void => {
  void it('accepts a supported identifier without throwing', (): void => {
    assert.doesNotThrow((): void => {
      assertSupportedAlgorithm('sha-256', supported);
    });
  });

  void it('rejects an unknown identifier with UNSUPPORTED_ALGORITHM', (): void => {
    assert.throws(
      (): void => {
        assertSupportedAlgorithm('rot13', supported);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof UnsupportedAlgorithmError, true);
        assert.equal(
          (error as UnsupportedAlgorithmError).code,
          'UNSUPPORTED_ALGORITHM'
        );
        assert.match((error as UnsupportedAlgorithmError).message, /'rot13'/);
        assert.match(
          (error as UnsupportedAlgorithmError).message,
          /sha-256, sha-512/
        );
        return true;
      }
    );
  });

  void it('rejects malformed identifiers such as uppercase names', (): void => {
    assert.throws(
      (): void => {
        assertSupportedAlgorithm('SHA-256', supported);
      },
      (error: unknown): boolean => {
        assert.equal(
          (error as UnsupportedAlgorithmError).code,
          'UNSUPPORTED_ALGORITHM'
        );
        return true;
      }
    );
  });
});

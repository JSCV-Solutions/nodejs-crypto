import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  InvalidArgumentError,
  InvalidEncodingError,
  MissingPeerDependencyError,
  NodeCryptoError,
  UnsupportedAlgorithmError
} from '../../src/shared/errors.ts';

void describe('shared errors', (): void => {
  void it('exposes every subclass as a NodeCryptoError with its code', (): void => {
    const cases: [NodeCryptoError, string, string][] = [
      [
        new InvalidArgumentError('bad argument'),
        'InvalidArgumentError',
        'INVALID_ARGUMENT'
      ],
      [
        new InvalidEncodingError('bad encoding'),
        'InvalidEncodingError',
        'INVALID_ENCODING'
      ],
      [
        new MissingPeerDependencyError('install bcrypt'),
        'MissingPeerDependencyError',
        'MISSING_PEER_DEPENDENCY'
      ],
      [
        new UnsupportedAlgorithmError('unknown algorithm'),
        'UnsupportedAlgorithmError',
        'UNSUPPORTED_ALGORITHM'
      ]
    ];
    for (const [error, name, code] of cases) {
      assert.equal(error instanceof NodeCryptoError, true);
      assert.equal(error instanceof Error, true);
      assert.equal(error.name, name);
      assert.equal(error.code, code);
    }
  });

  void it('keeps the message and cause given by the throwing code', (): void => {
    const cause: Error = new Error('root failure');
    const error: InvalidArgumentError = new InvalidArgumentError(
      'Expected a 32-byte key.',
      { cause }
    );
    assert.equal(error.message, 'Expected a 32-byte key.');
    assert.equal(error.cause, cause);
  });

  void it('builds the base class with an explicit code', (): void => {
    const error: NodeCryptoError = new NodeCryptoError(
      'Something failed.',
      'INVALID_ARGUMENT'
    );
    assert.equal(error instanceof Error, true);
    assert.equal(error.name, 'NodeCryptoError');
    assert.equal(error.code, 'INVALID_ARGUMENT');
  });
});

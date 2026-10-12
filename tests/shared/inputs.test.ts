import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { InvalidArgumentError } from '../../src/shared/errors.ts';
import { toBytes } from '../../src/shared/inputs.ts';
import type { CryptoInput } from '../../src/shared/typings/inputs.js';

void describe('shared inputs', (): void => {
  void it('treats the same bytes as identical across input types', (): void => {
    const text: string = 'hello';
    const fromString: Buffer = toBytes(text);
    const fromBuffer: Buffer = toBytes(Buffer.from(text, 'utf8'));
    const fromView: Buffer = toBytes(new Uint8Array([104, 101, 108, 108, 111]));
    assert.equal(fromString.equals(fromBuffer), true);
    assert.equal(fromString.equals(fromView), true);
  });

  void it('interprets strings as UTF-8', (): void => {
    const input: string = 'héllo';
    assert.deepEqual(toBytes(input), Buffer.from(input, 'utf8'));
  });

  void it('copies bytes so caller buffers stay independent', (): void => {
    const original: Buffer = Buffer.from([1, 2, 3]);
    const copy: Buffer = toBytes(original);
    copy[0] = 9;
    assert.deepEqual(original, Buffer.from([1, 2, 3]));
  });

  void it('rejects unexpected types with INVALID_ARGUMENT', (): void => {
    const notInput: CryptoInput = 123 as unknown as CryptoInput;
    assert.throws(
      (): void => {
        toBytes(notInput);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof InvalidArgumentError, true);
        assert.equal((error as InvalidArgumentError).code, 'INVALID_ARGUMENT');
        return true;
      }
    );
  });
});

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  decodeText,
  encodeBytes,
  isWellFormed
} from '../../src/shared/encodings.ts';
import { InvalidEncodingError } from '../../src/shared/errors.ts';

const raw: Uint8Array = new Uint8Array([0, 1, 2, 250, 255]);

void describe('shared encodings', (): void => {
  void it('round-trips bytes through every supported encoding', (): void => {
    assert.equal(encodeBytes(raw, 'hex'), '000102faff');
    assert.equal(encodeBytes(raw, 'base64'), 'AAEC+v8=');
    assert.equal(encodeBytes(raw, 'base64url'), 'AAEC-v8');
    assert.deepEqual(decodeText('000102faff', 'hex'), Buffer.from(raw));
    assert.deepEqual(decodeText('AAEC+v8=', 'base64'), Buffer.from(raw));
    assert.deepEqual(decodeText('AAEC-v8', 'base64url'), Buffer.from(raw));
  });

  void it('encodes a plain Uint8Array, not only Buffers', (): void => {
    const text: string = encodeBytes(new Uint8Array([104, 105]), 'hex');
    assert.equal(text, '6869');
  });

  void it('rejects malformed hexadecimal with INVALID_ENCODING', (): void => {
    for (const text of ['abc', 'zz', '0x12', '12 34']) {
      assert.throws(
        (): void => {
          decodeText(text, 'hex');
        },
        (error: unknown): boolean => {
          assert.equal(
            (error as InvalidEncodingError).code,
            'INVALID_ENCODING'
          );
          return true;
        }
      );
    }
  });

  void it('rejects text outside the base64 and base64url alphabets', (): void => {
    assert.throws((): void => {
      decodeText('!!!', 'base64');
    }, InvalidEncodingError);
    assert.throws((): void => {
      decodeText('AB', 'base64');
    }, InvalidEncodingError);
    assert.throws((): void => {
      decodeText('AAEC+v8=', 'base64url');
    }, InvalidEncodingError);
    assert.throws((): void => {
      decodeText('***', 'base64url');
    }, InvalidEncodingError);
  });

  void it('never echoes the offending input in the error message', (): void => {
    const secretShaped: string = 'zz-top-secret-bytes-!!';
    try {
      decodeText(secretShaped, 'hex');
      assert.fail('decodeText should have thrown');
    } catch (error: unknown) {
      assert.equal(error instanceof InvalidEncodingError, true);
      assert.equal(
        (error as InvalidEncodingError).message.includes(secretShaped),
        false
      );
    }
  });

  void it('validates shapes without decoding', (): void => {
    assert.equal(isWellFormed('00ff', 'hex'), true);
    assert.equal(isWellFormed('0', 'hex'), false);
    assert.equal(isWellFormed('AAEC+v8=', 'base64'), true);
    assert.equal(isWellFormed('AAEC+v8', 'base64'), false);
    assert.equal(isWellFormed('AAEC-v8', 'base64url'), true);
    assert.equal(isWellFormed('AAEC-v8=', 'base64url'), true);
    assert.equal(isWellFormed('A', 'base64url'), false);
  });
});

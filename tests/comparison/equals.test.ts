import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { InvalidArgumentError } from '../../src/shared/errors.ts';
import { equals, equalsSync } from '../../src/packages/comparison/index.ts';
import type { CryptoInput } from '../../src/shared/typings/inputs.js';

void describe('comparison equals', (): void => {
  void it('returns true for equal strings', async (): Promise<void> => {
    assert.equal(await equals('abc', 'abc'), true);
    assert.equal(equalsSync('abc', 'abc'), true);
  });

  void it('returns false for same-length differing values', async (): Promise<void> => {
    assert.equal(await equals('abc', 'abd'), false);
    assert.equal(equalsSync('abc', 'abd'), false);
  });

  void it('returns true for empty operands', async (): Promise<void> => {
    assert.equal(await equals('', ''), true);
    assert.equal(equalsSync('', ''), true);
  });

  void it('treats equivalent containers as equal', async (): Promise<void> => {
    const text: string = 'hello';
    const buffer: Buffer = Buffer.from(text, 'utf8');
    const view: Uint8Array = new Uint8Array(buffer);
    assert.equal(await equals(text, buffer), true);
    assert.equal(await equals(text, view), true);
    assert.equal(await equals(buffer, view), true);
    assert.equal(equalsSync(text, buffer), true);
    assert.equal(equalsSync(text, view), true);
    assert.equal(equalsSync(buffer, view), true);
  });

  void it('compares multibyte strings by UTF-8 bytes', async (): Promise<void> => {
    const text: string = 'héllo';
    const bytes: Buffer = Buffer.from(text, 'utf8');
    assert.equal(await equals(text, bytes), true);
    assert.equal(equalsSync(text, bytes), true);
  });

  void it('returns false when byte lengths differ', async (): Promise<void> => {
    assert.equal(await equals('abc', 'abcd'), false);
    assert.equal(equalsSync('abc', 'abcd'), false);
    assert.equal(await equals('', 'a'), false);
    assert.equal(equalsSync('', 'a'), false);
  });

  void it('returns false for a long pair differing only in the final byte', async (): Promise<void> => {
    const base: string = 'a'.repeat(1024);
    const other: string = base.slice(0, -1) + 'b';
    assert.equal(await equals(base, other), false);
    assert.equal(equalsSync(base, other), false);
  });

  void it('throws INVALID_ARGUMENT for non-CryptoInput operands', async (): Promise<void> => {
    const badValues: unknown[] = [123, null, undefined, { x: 1 }, true];
    for (const value of badValues) {
      assert.throws(
        (): void => {
          equalsSync(value as never, 'abc');
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
      await assert.rejects(
        equals(value as never, 'abc'),
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

  void it('keeps error messages free of operand bytes', (): void => {
    try {
      equalsSync(123 as never, 'abc');
      assert.fail('expected throw');
    } catch (error: unknown) {
      const message: string = (error as Error).message;
      assert.equal(message.includes('abc'), false);
      assert.equal(message.includes('123'), false);
    }
  });

  void it('keeps async and sync result and error parity', async (): Promise<void> => {
    const pairs: [CryptoInput, CryptoInput][] = [
      ['abc', 'abc'],
      ['abc', 'abd'],
      ['abc', 'abcd'],
      ['', '']
    ];
    for (const [a, b] of pairs) {
      const asyncResult: boolean = await equals(a, b);
      const syncResult: boolean = equalsSync(a, b);
      assert.equal(asyncResult, syncResult);
    }
  });
});

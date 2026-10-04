import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { namespace } from '../src/packages/comparison/index.ts';

void describe('toolchain', (): void => {
  void it('executes TypeScript sources directly', (): void => {
    const expected: string = 'comparison';
    assert.equal(namespace, expected);
  });
});

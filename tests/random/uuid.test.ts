import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import * as random from '../../src/packages/random/index.ts';
import { uuid } from '../../src/packages/random/uuid.ts';

const pattern: RegExp =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

void describe('random uuid', (): void => {
  void it('returns lowercase version 4 UUIDs', (): void => {
    for (let round: number = 0; round < 10; round = round + 1) {
      const value: string = uuid();
      assert.match(value, pattern);
    }
  });

  void it('returns distinct values on successive calls', (): void => {
    const first: string = uuid();
    const second: string = uuid();
    assert.match(first, pattern);
    assert.match(second, pattern);
    assert.equal(first === second, false);
  });

  void it('exposes a sync-only uuid without async or Sync variants', (): void => {
    assert.equal(typeof random.uuid, 'function');
    const entry: Record<string, unknown> = random;
    assert.equal(entry.uuidSync, undefined);
  });
});

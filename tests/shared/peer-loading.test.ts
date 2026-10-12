import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  MissingPeerDependencyError,
  NodeCryptoError
} from '../../src/shared/errors.ts';
import { loadPeer, loadPeerSync } from '../../src/shared/peer-loading.ts';
import { loadSyncPeer as loadSyncPeerEsm } from '../../src/shared/require-sync-esm.ts';
import { loadSyncPeer as loadSyncPeerCjs } from '../../src/shared/require-sync-cjs.ts';

const missingSpecifier: string = 'node-crypto-test-missing-peer';

void describe('shared peer loading', (): void => {
  void it('sync-loads an installed peer and reuses the cached module', (): void => {
    const first: unknown = loadPeerSync('bcrypt');
    const second: unknown = loadPeerSync('bcrypt');
    assert.equal(typeof (first as { hash: unknown }).hash, 'function');
    assert.equal(first === second, true);
  });

  void it('async-loads the same peer as the sync variant', async (): Promise<void> => {
    const syncPeer: unknown = loadPeerSync('bcrypt');
    const asyncPeer: unknown = await loadPeer('bcrypt');
    assert.equal(typeof (syncPeer as { hash: unknown }).hash, 'function');
    assert.equal(typeof (asyncPeer as { hash: unknown }).hash, 'function');
  });

  void it('throws MISSING_PEER_DEPENDENCY with an install hint', (): void => {
    assert.throws(
      (): void => {
        loadPeerSync(missingSpecifier);
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof MissingPeerDependencyError, true);
        assert.equal(error instanceof NodeCryptoError, true);
        assert.equal(
          (error as MissingPeerDependencyError).code,
          'MISSING_PEER_DEPENDENCY'
        );
        assert.match(
          (error as MissingPeerDependencyError).message,
          new RegExp(missingSpecifier)
        );
        assert.match(
          (error as MissingPeerDependencyError).message,
          /not installed/
        );
        return true;
      }
    );
  });

  void it('rejects with MISSING_PEER_DEPENDENCY from the async path', async (): Promise<void> => {
    await assert.rejects(
      (): Promise<unknown> => loadPeer(missingSpecifier),
      (error: unknown): boolean => {
        assert.equal(
          (error as MissingPeerDependencyError).code,
          'MISSING_PEER_DEPENDENCY'
        );
        return true;
      }
    );
  });

  void it('propagates load failures other than a missing module', async (): Promise<void> => {
    await assert.rejects(
      (): Promise<unknown> =>
        loadPeer('@jscv-solutions/node-crypto/package.json'),
      (error: unknown): boolean => {
        assert.equal(
          (error as { code?: unknown }).code === 'MISSING_PEER_DEPENDENCY',
          false
        );
        return true;
      }
    );
  });

  void it('loads through the ESM per-format file on sources', (): void => {
    const peer: unknown = loadSyncPeerEsm('bcrypt');
    assert.equal(typeof (peer as { hash: unknown }).hash, 'function');
  });

  void it('documents that the CJS per-format file needs a CJS process', (): void => {
    assert.throws(
      (): void => {
        loadSyncPeerCjs('bcrypt');
      },
      (error: unknown): boolean => {
        assert.equal(error instanceof ReferenceError, true);
        return true;
      }
    );
  });
});

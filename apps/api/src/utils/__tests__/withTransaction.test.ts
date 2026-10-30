// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { describe, expect, it, vi } from 'vitest';

import { createWithTransaction } from '../withTransaction.js';

function mockDb(callbackResult?: unknown) {
  const transaction = vi.fn(async (fn: (tx: unknown) => unknown) => {
    const tx = { __tx: true };
    const value = await fn(tx);
    return callbackResult ?? value;
  });
  return { transaction } as unknown as NodePgDatabase;
}

describe('createWithTransaction', () => {
  it('runs the callback inside a transaction and returns its result', async () => {
    const db = mockDb();
    const withTransaction = createWithTransaction(db);

    const result = await withTransaction(async (repos, tx) => {
      expect(repos.featureFlagsRepository).toBeDefined();
      expect(repos.flagEnvironmentsRepository).toBeDefined();
      expect(tx).toEqual({ __tx: true });
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it('propagates errors thrown inside the callback (rolls the tx back)', async () => {
    const db = mockDb();
    const withTransaction = createWithTransaction(db);

    await expect(
      withTransaction(async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });
});

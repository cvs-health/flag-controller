// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { vi } from 'vitest';

import type { DbOrTx } from '../types/db.js';

export type MockMethods = ReturnType<typeof createMockMethods>;

function createMockMethods() {
  const methods = {
    $dynamic: vi.fn(),
    $with: vi.fn(),
    with: vi.fn(),
    as: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
    for: vi.fn(),
    from: vi.fn(),
    groupBy: vi.fn(),
    innerJoin: vi.fn(),
    insert: vi.fn(),
    leftJoin: vi.fn(),
    crossJoin: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    onConflictDoNothing: vi.fn(),
    onConflictDoUpdate: vi.fn(),
    orderBy: vi.fn(),
    returning: vi.fn(),
    select: vi.fn(),
    set: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
    values: vi.fn(),
    where: vi.fn(),
  };

  Object.values(methods).forEach((method) => {
    method.mockReturnValue(methods);
  });

  // Make methods iterable (like a Drizzle query result resolving to an empty array)
  // so that `const [row] = await query.where(...).limit(1)` works in tests.
  (methods as Record<symbol, unknown>)[Symbol.iterator] = function* () {};

  return methods;
}

function mockDb(): [DbOrTx, MockMethods] {
  const methods = createMockMethods();

  const from = vi.fn().mockReturnValue(methods);
  const select = vi.fn().mockReturnValue({ from });
  const selectDistinct = vi.fn().mockReturnValue({ from });

  // Model Drizzle's CTE flow (WITH)
  methods.$with.mockImplementation(() => {
    return { as: methods.as };
  });
  methods.with.mockImplementation(() => ({ select, selectDistinct }));

  // Make transaction execute the callback
  methods.transaction.mockImplementation(async (cb) => {
    if (typeof cb === 'function') {
      return cb(db);
    }
    return methods;
  });

  const db = {
    $with: methods.$with,
    with: methods.with,
    select,
    selectDistinct,
    insert: methods.insert,
    update: methods.update,
    delete: methods.delete,
    transaction: methods.transaction,
  } as unknown as DbOrTx;

  return [db, methods];
}

export function mockTransaction<_T>(_callback: (tx: DbOrTx) => Promise<unknown>) {
  const [db, methods] = mockDb();

  methods.transaction.mockImplementation(async (...args: unknown[]) => {
    const fn = args[0] as (tx: DbOrTx) => Promise<unknown>;
    const txMock = { ...db } as DbOrTx;
    return fn(txMock) as unknown as Promise<unknown>;
  });

  return [db, methods];
}

export function mockReturning(methods: MockMethods, returnValue: unknown[]) {
  methods.returning.mockResolvedValue(returnValue);
}

export default mockDb;

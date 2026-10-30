// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import createRepositories, { type Repositories } from 'utils/createRepositories.js';
import type { Tx } from '../types/db.js';

/**
 * Runs `fn` inside a database transaction and hands it a fresh bundle of
 * tx-bound repositories. Throwing inside `fn` rolls the transaction back;
 * returning normally commits.
 *
 * The callback also receives the raw transaction handle (`tx`) as an
 * escape hatch for writes that don't yet have a dedicated repository method.
 * Prefer using `repos` and only reach for `tx` when no repo method exists.
 *
 * Services depend on `WithTransaction` directly (not on `fastify.drizzle`),
 * which keeps them transport-agnostic and easy to unit test — a test can
 * pass `(fn) => fn(mockRepositories, mockTx)` as a passthrough.
 */
export type WithTransaction = <T>(fn: (repos: Repositories, tx: Tx) => Promise<T>) => Promise<T>;

export function createWithTransaction(db: NodePgDatabase): WithTransaction {
  return (fn) => db.transaction((tx) => fn(createRepositories(tx), tx));
}

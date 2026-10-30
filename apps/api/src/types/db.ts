// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type Tx = Parameters<NodePgDatabase['transaction']>[0] extends (tx: infer T) => unknown ? T : never;
export type DbOrTx = NodePgDatabase | Tx;

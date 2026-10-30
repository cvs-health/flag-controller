// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { desc } from 'drizzle-orm';

import type { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core';
import type { OrderByTemplate } from '../types/fastify.js';

/**
 * Creates an order by clause for database queries based on column and sort method
 */
function getOrderByFromQuerystring<T extends TableConfig>(
  table: PgTableWithColumns<T>,
  defaultValue: OrderByTemplate,
  orderByString?: OrderByTemplate,
) {
  const [orderByColumn, orderByMethod] = (orderByString ?? defaultValue).split(':') as [
    keyof typeof table.$inferSelect,
    'asc' | 'desc',
  ];

  return orderByMethod === 'asc' ? table[orderByColumn] : desc(table[orderByColumn]);
}

export default getOrderByFromQuerystring;

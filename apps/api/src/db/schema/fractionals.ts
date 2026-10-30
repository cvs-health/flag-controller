// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FractionalType, FractionalWeight } from 'shared-types';
import { check, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const fractionals = pgTable(
  'fractionals',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    weights: jsonb('weights').notNull().default([]).$type<FractionalWeight[]>(),
    var: text('var'),
    type: text('type').notNull().$type<FractionalType>(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [check('fractional_type_check', sql`${table.type} IN ('contextual', 'weight-only')`)],
);

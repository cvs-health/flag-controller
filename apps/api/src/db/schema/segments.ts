// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

import { applications } from './applications.js';

export const segments = pgTable(
  'segments',
  {
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),
    description: text('description').notNull(),
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    key: text('key').notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('segments_application_id_key_unique').on(table.applicationId, table.key),
    index('segments_application_id_idx').on(table.applicationId),
  ],
);

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import type { EnvironmentKey } from 'shared-types';

import { applications } from './applications.js';

export const environments = pgTable(
  'environments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id),
    key: text('key').notNull().$type<EnvironmentKey>(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('environments_application_id_key_unique').on(table.applicationId, table.key),
    index('environments_application_id_idx').on(table.applicationId),
  ],
);

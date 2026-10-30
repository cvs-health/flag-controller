// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { environments } from './environments.js';
import { featureFlags } from './featureFlags.js';
import { flagVariations } from './flagVariations.js';

export const flagEnvironments = pgTable(
  'flag_environments',
  {
    flagId: text('flag_id')
      .notNull()
      .references(() => featureFlags.id),
    environmentId: text('environment_id')
      .notNull()
      .references(() => environments.id),
    enabled: boolean('enabled').default(false).notNull(),
    defaultServeId: text('default_serve_id')
      .notNull()
      .references(() => flagVariations.id),
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
    primaryKey({ columns: [table.flagId, table.environmentId] }),
    index('flag_environments_environment_id_idx').on(table.environmentId),
  ],
);

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { boolean, check, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

import { applications } from './applications.js';

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id),
    archived: boolean('archived').default(false).notNull(),
    description: text('description').notNull(),
    key: text('key').notNull(),
    type: text('type').default(FeatureFlagType.Boolean).notNull().$type<FeatureFlagType>(),
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
  (table) => [
    unique('feature_flags_app_id_feature_flag_key_unique').on(table.applicationId, table.key),
    check('feature_flag_type_check', sql`${table.type} IN ('boolean', 'integer', 'object', 'string')`),
  ],
);

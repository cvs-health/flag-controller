// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import type { FeatureFlagType, FeatureFlagTypeToPrimitive } from 'shared-types';

import { featureFlags } from './featureFlags.js';

export const flagVariations = pgTable(
  'flag_variations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    flagId: text('flag_id')
      .notNull()
      .references(() => featureFlags.id),
    key: text('key').notNull(),
    value: jsonb('value').notNull().$type<FeatureFlagTypeToPrimitive<FeatureFlagType>>(),
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
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),
  },
  (table) => [
    index('flag_variations_flag_id_idx').on(table.flagId),
    index('flag_variations_key_idx').on(table.key),
    index('flag_variations_flag_id_key_idx').on(table.flagId, table.key),
    index('flag_variations_flag_id_deleted_at_idx').on(table.flagId, table.deletedAt),
    unique('flag_variations_flag_id_key_unique').on(table.flagId, table.key),
  ],
);

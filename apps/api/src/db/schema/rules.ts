// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { sql } from 'drizzle-orm';
import { check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { ContextRuleCondition, SegmentRuleCondition, TimeRuleCondition } from 'shared-types';
import { nanoid } from 'nanoid';

import { environments } from './environments.js';
import { featureFlags } from './featureFlags.js';
import { fractionals } from './fractionals.js';
import { segments } from './segments.js';
import { flagVariations } from './flagVariations.js';

export const rules = pgTable(
  'rules',
  {
    conditions: jsonb('conditions')
      .notNull()
      .default([])
      .$type<(ContextRuleCondition | SegmentRuleCondition | TimeRuleCondition)[]>(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),
    environmentId: text('environment_id')
      .notNull()
      .references(() => environments.id),
    flagId: text('flag_id')
      .references(() => featureFlags.id)
      .$type<string | null>(),
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    key: text('key').notNull().default('default'),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    orderPosition: integer('order_position').notNull(),
    serveFractionalId: text('serve_fractional_id')
      .references(() => fractionals.id)
      .$type<string | null>(),
    serveVariationId: text('serve_variation_id')
      .references(() => flagVariations.id)
      .$type<string | null>(),
    segmentId: text('segment_id')
      .references(() => segments.id)
      .$type<string | null>(),
  },
  (table) => [
    check(
      'rule_serve_target_at_most_one_check',
      sql`${table.serveFractionalId} IS NULL OR ${table.serveVariationId} IS NULL`,
    ),
    index('rules_environment_id_idx').on(table.environmentId),
    index('rules_serve_fractional_id_idx').on(table.serveFractionalId),
    index('rules_serve_variation_id_idx').on(table.serveVariationId),
    index('rules_segment_id_idx').on(table.segmentId),
    index('rules_flag_id_idx').on(table.flagId),
    uniqueIndex('rules_segment_id_environment_id_uidx')
      .on(table.segmentId, table.environmentId)
      .where(sql`${table.segmentId} IS NOT NULL AND ${table.deletedAt} IS NULL`),
  ],
);

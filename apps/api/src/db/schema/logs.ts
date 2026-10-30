// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { index, jsonb, pgTable, text, timestamp, check } from 'drizzle-orm/pg-core';
import type { ActionType, SubjectType } from 'shared-types';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

import { applications } from './applications.js';
import { environments } from './environments.js';

type Data = Record<string, unknown>;

export const logs = pgTable(
  'logs',
  {
    action: text('action').notNull().$type<ActionType>(),
    actorId: text('actor_id').notNull(),
    applicationId: text('application_id').references(() => applications.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    environmentId: text('environment_id').references(() => environments.id),
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    oldData: jsonb('old_data').$type<Data>(),
    newData: jsonb('new_data').$type<Data>(),
    subjectId: text('subject_id').notNull(),
    subjectKey: text('subject_key').notNull(),
    subjectType: text('subject_type').notNull().$type<SubjectType>(),
  },
  (table) => [
    index('logs_application_id_idx').on(table.applicationId),
    index('logs_application_id_subject_id_idx').on(table.applicationId, table.subjectId),
    check(
      'log_subject_type_check',
      sql`${table.subjectType} IN ('application', 'context', 'feature-flag', 'rule', 'segment', 'team', 'variation', 'feature-flag-environment')`,
    ),
    check(
      'log_action_type_check',
      sql`${table.action} IN ('archive', 'create', 'delete', 'disable', 'edit', 'enable', 'restore')`,
    ),
  ],
);

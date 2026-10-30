// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

import { applications } from './applications.js';

export const contexts = pgTable('contexts', {
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id),
  attributes: json('attributes').$type<string[]>(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
  }),
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
});

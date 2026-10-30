// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate as pgmigrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

import { featureFlags } from 'db/schema/featureFlags.js';
import { connectionSettings } from './plugins/drizzle.js';

export async function migrate() {
  console.log('⏳ Setting up pg client...');
  const client = new pg.Client(connectionSettings);

  console.log('⏳ Connecting to database...');
  await client.connect();

  const db = drizzle(client, { schema: { featureFlags } });

  console.log('⏳ Running migrations...');
  const start = Date.now();

  // This will run migrations on the database, skipping the ones already applied
  await pgmigrate(db, { migrationsFolder: './drizzle' });

  // Don't forget to close the connection, otherwise the script will hang
  await client.end();

  const end = Date.now();

  console.log(`✅ Migration complete. Done in ${end - start}ms`);
}

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { drizzle } from 'drizzle-orm/node-postgres';
import fp from 'fastify-plugin';
import { Pool, type PoolConfig } from 'pg';

function getSslConfig() {
  return {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT?.replace(/\\n/g, '\n'),
    key: process.env.DB_SSL_KEY?.replace(/\\n/g, '\n'),
    cert: process.env.DB_SSL_CERT?.replace(/\\n/g, '\n'),
  };
}

function getConnectionSettings() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: getSslConfig(),
  };
}

export const connectionSettings = getConnectionSettings();

export const poolSettings: PoolConfig = {
  max: Number(process.env.DB_POOL_MAX) || 40,
  min: Number(process.env.DB_POOL_MIN) || 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500,
  ...connectionSettings,
};

/**
 * Connects to the database and makes the Drizzle Client available through the fastify server instance
 */
const drizzlePlugin = fp(async (server) => {
  try {
    const pool = new Pool(poolSettings);
    pool.on('error', (err) => {
      server.log.error(err, 'Unexpected error on idle client');
    });

    const db = drizzle(pool);

    server.decorate('drizzle', db);
    server.decorate('pool', pool);

    server.addHook('onClose', async (instance) => {
      await instance.pool.end();
    });
  } catch (error) {
    server.log.error(error, 'Error connecting to database');
    throw error;
  }
});

export default drizzlePlugin;

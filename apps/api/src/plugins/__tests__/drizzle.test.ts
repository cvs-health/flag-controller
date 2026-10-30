// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fastify from 'fastify';
import type { Pool } from 'pg';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockPoolEnd = vi.fn().mockImplementation(() => Promise.resolve());
  const mockPoolOn = vi.fn();
  const mockPoolInstance = {
    on: mockPoolOn,
    end: mockPoolEnd,
    connect: vi.fn(() => Promise.resolve()),
  };
  return {
    drizzle: vi.fn(() => ({
      query: vi.fn(),
    })),
    Pool: vi.fn(function (this: Pool) {
      this.on = mockPoolInstance.on;
      this.end = mockPoolInstance.end;
      // @ts-expect-error We don't need a full implementation for the test
      this.connect = mockPoolInstance.connect;
    }),
  };
});

vi.mock('pg', () => {
  return { Pool: mocks.Pool };
});

vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: mocks.drizzle,
}));

describe('drizzlePlugin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('initializes the database connection and closes it', async () => {
    const { default: drizzlePlugin, connectionSettings } = await import('../drizzle.js');
    const app = fastify();

    await app.register(drizzlePlugin);

    expect(app.drizzle).toBeDefined();
    expect(app.pool).toBeDefined();
    expect(mocks.drizzle).toHaveBeenCalledOnce();
    expect(connectionSettings).toHaveProperty('ssl');
    expect(connectionSettings).not.toHaveProperty('connectionString');
    expect(mocks.Pool).toHaveBeenCalledOnce();
    expect(mocks.drizzle).toHaveBeenCalledWith(app.pool);
    await app.close();

    expect(app.pool.end).toHaveBeenCalledOnce();
  });

  it('initializes the database connection from DATABASE_URL', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://random-db-url');

    const { default: drizzlePlugin, connectionSettings } = await import('../drizzle.js');
    const app = fastify();

    await app.register(drizzlePlugin);

    expect(app.drizzle).toBeDefined();
    expect(app.pool).toBeDefined();
    expect(mocks.drizzle).toHaveBeenCalledOnce();
    expect(mocks.Pool).toHaveBeenCalledOnce();
    expect(connectionSettings).toHaveProperty('connectionString');
    expect(connectionSettings).not.toHaveProperty('ssl');
    expect(mocks.drizzle).toHaveBeenCalledWith(app.pool);

    await app.close();

    expect(app.pool.end).toHaveBeenCalledOnce();
  });
});

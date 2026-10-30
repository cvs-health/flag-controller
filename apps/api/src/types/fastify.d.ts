// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import type { Repositories } from 'utils/createRepositories.js';
import type { RequestUserDetails } from './users.js';
import type { Services } from './services.ts';
import type { WithTransaction } from 'utils/withTransaction.js';

export type OrderByTemplate = `${string}:${'asc' | 'desc'}`;

export interface ResponseMetadata {
  page: number;
  records: number;
  rows: number;
  totalPages: number;
  totalRecords: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUserDetails;
  }

  interface FastifyInstance {
    drizzle: NodePgDatabase;
    withTransaction: WithTransaction;
    repositories: Repositories;
    services: Services;
    pool: Pool;
  }
}

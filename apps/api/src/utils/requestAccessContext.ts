// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '../auth.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';
import { ColumnSortingDirection } from '../types/common.js';

/**
 * Resolves application IDs accessible to the authenticated user's request.
 *
 * @param fastify - The Fastify instance.
 * @param request - The Fastify request.
 * @returns A promise that resolves to an array of application IDs accessible to the user.
 */
export async function resolveRequestApplicationIds(fastify: FastifyInstance, request: FastifyRequest) {
  const teams = await auth.api.listUserTeams({ headers: fromNodeHeaders(request.headers) });
  const teamIds = teams.map((team) => team.id);

  if (!teamIds.length) {
    return [];
  }

  const applications = await fastify.services.applicationsService.listApplications({
    filters: {
      teamIds,
    },
    pagination: {
      page: 1,
      rows: PAGINATION_NO_LIMIT,
    },
    sort: {
      direction: ColumnSortingDirection.ASC,
      field: 'name',
    },
  });

  return applications.data.map((app) => app.id);
}

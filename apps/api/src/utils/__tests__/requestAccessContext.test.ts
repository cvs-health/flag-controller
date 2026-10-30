// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';

import { resolveRequestApplicationIds } from '../requestAccessContext.js';

const mocks = vi.hoisted(() => ({
  listUserTeams: vi.fn(),
}));

vi.mock('../../auth.js', () => ({
  auth: {
    api: {
      listUserTeams: mocks.listUserTeams,
    },
  },
}));

describe('requestAccessContext', () => {
  describe('resolveRequestApplicationIds', () => {
    it('resolves application IDs from the request user teams', async () => {
      mocks.listUserTeams.mockResolvedValue([{ id: 'team-1' }, { id: 'team-2' }]);
      vi.mocked(mockServices.applications.listApplications).mockResolvedValue({
        data: [
          {
            id: 'app-1',
            name: 'App 1',
            teamId: 'team-1',
            teamName: 'test-team',
            description: null,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            deletedAt: null,
          },
          {
            id: 'app-2',
            name: 'App 2',
            teamId: 'team-2',
            teamName: 'test-team',
            description: null,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            deletedAt: null,
          },
        ],
        metadata: {
          page: 1,
          records: 2,
          rows: 2,
          totalPages: 1,
          totalRecords: 2,
        },
      });

      const fastify = build({
        services: {
          applicationsService: mockServices.applications,
        },
      });
      await fastify.ready();

      const request = {
        headers: {
          authorization: 'Bearer test-token',
        },
      } as FastifyRequest;

      const result = await resolveRequestApplicationIds(fastify, request);

      await fastify.close();

      expect(mocks.listUserTeams).toHaveBeenCalledExactlyOnceWith({
        headers: expect.any(Headers),
      });
      expect(mockServices.applications.listApplications).toHaveBeenCalledExactlyOnceWith({
        filters: {
          teamIds: ['team-1', 'team-2'],
        },
        pagination: {
          page: 1,
          rows: -1,
        },
        sort: {
          direction: 'asc',
          field: 'name',
        },
      });
      expect(result).toEqual(['app-1', 'app-2']);
    });

    it('uses an empty team filter when the request user has no teams', async () => {
      mocks.listUserTeams.mockResolvedValue([]);

      const fastify = build({
        services: {
          applicationsService: mockServices.applications,
        },
      });
      await fastify.ready();

      const request = {
        headers: {
          authorization: 'Bearer test-token',
        },
      } as FastifyRequest;

      const result = await resolveRequestApplicationIds(fastify, request);

      await fastify.close();

      expect(mockServices.applications.listApplications).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

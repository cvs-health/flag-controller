// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, FeatureFlagType, SubjectType } from 'shared-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LogsService } from 'services/logsService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';

describe('logsService', () => {
  let service: LogsService;

  beforeEach(() => {
    service = createServiceWithMocks.logs;
  });

  describe('listLogs', () => {
    it('lists logs with the expected parameters', async () => {
      const logEntry = {
        action: ActionType.Create,
        actorEmail: 'email@email.com',
        actorId: 'actor-id',
        applicationId: 'application-id',
        applicationName: 'test-app',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        environmentId: 'environment-id',
        environmentKey: EnvironmentKey.Development,
        id: 'log-id',
        newData: { new: 'data' },
        oldData: { old: 'data' },
        subjectId: 'flag-id',
        subjectKey: 'flag-key',
        subjectType: SubjectType.FeatureFlag,
      };

      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([
        {
          id: 'application-id',
          name: 'test-app',
          teamId: 'team-1',
          teamName: 'test-team',
          description: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          deletedAt: null,
        },
      ]);
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([
        {
          applicationId: 'test-app',
          applicationName: 'test-app',
          archived: false,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          deletedAt: null,
          description: 'Test flag',
          id: 'flag-id',
          key: 'flag-key',
          type: FeatureFlagType.Boolean,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([
        {
          id: 'environment-id',
          applicationId: 'app-id',
          key: EnvironmentKey.Development,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          defaultServeId: 'serve-id',
          defaultServeKey: 'serve-key',
          enabled: true,
          environmentId: 'environment-id',
          environmentKey: EnvironmentKey.Development,
          flag: {
            applicationId: 'application-id',
            key: 'flag-key',
          },
          flagId: 'flag-id',
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      vi.mocked(mockRepositories.logsRepository.count).mockResolvedValue(1);
      vi.mocked(mockRepositories.logsRepository.list).mockResolvedValue([logEntry]);
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([
        {
          conditions: [],
          createdAt: new Date('2024-01-01T00:00:00Z'),
          deletedAt: null,
          environmentId: 'environment-id',
          flagId: 'flag-id',
          flagKey: 'flag-key',
          id: 'rule-id',
          key: 'rule-key',
          orderPosition: 1,
          segmentId: null,
          segmentKey: null,
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: 'variation-id',
          serveVariationKey: 'variation-key',
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      const response = await service.listLogs({
        filters: {
          and: {
            actionEndDate: '2024-01-31T23:59:59Z',
            actionStartDate: '2024-01-01T00:00:00Z',
            actionTypes: [ActionType.Create],
            applicationIds: ['application-id'],
            environmentIds: ['environment-id'],
            subjectKeys: ['flag-key', 'rule-key'],
            subjectTypes: [SubjectType.FeatureFlag],
            search: 'test-app',
          },
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
        pagination: {
          page: 1,
          rows: 10,
        },
      });
      const data = [
        {
          action: ActionType.Create,
          actor: { email: logEntry.actorEmail, id: logEntry.actorId },
          application: { id: logEntry.applicationId, name: logEntry.applicationName },
          createdAt: logEntry.createdAt,
          environment: { id: logEntry.environmentId, key: logEntry.environmentKey },
          id: logEntry.id,
          newData: logEntry.newData,
          oldData: logEntry.oldData,
          subject: { id: logEntry.subjectId, key: logEntry.subjectKey, type: logEntry.subjectType },
        },
      ];

      expect(mockRepositories.logsRepository.list).toHaveBeenCalledWith({
        filters: {
          and: {
            applicationIds: ['application-id'],
            environmentIds: ['environment-id'],
            subjectKeys: ['flag-key', 'rule-key'],
            actionEndDate: '2024-01-31T23:59:59Z',
            actionStartDate: '2024-01-01T00:00:00Z',
            actionTypes: [ActionType.Create],
            search: 'test-app',
            subjectTypes: [SubjectType.FeatureFlag],
          },
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
      });

      expect(response).toEqual({
        data,
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          search: 'test-app',
          sort: 'createdAt:desc',
          totalPages: 1,
          totalRecords: 1,
        },
      });
    });
  });
});

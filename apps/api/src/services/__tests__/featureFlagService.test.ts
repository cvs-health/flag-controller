// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionType, EnvironmentKey, FeatureFlagType, SubjectType } from 'shared-types';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors/AppError.js';
import type { CreateFeatureFlagPayload, FeatureFlagService } from 'services/featureFlagService.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';

const applicationId = 'app-1';
const environmentKey = EnvironmentKey.Development;
const featureFlagKey = 'flag-key';
const actor = { id: 'user-1', email: 'user@example.com' };

const baseApplication = {
  createdAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
  description: 'app description',
  id: applicationId,
  name: 'test-app',
  teamId: 'team-1',
  teamName: 'Test Team',
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseEnvironment = {
  id: 'env-1',
  applicationId,
  key: environmentKey,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseFlag = {
  applicationId,
  applicationName: baseApplication.name,
  archived: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
  description: 'feature flag description',
  id: 'flag-1',
  key: featureFlagKey,
  type: FeatureFlagType.Boolean,
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseFlagEnvironment = {
  createdAt: new Date('2024-01-01T00:00:00Z'),
  defaultServeId: 'variation-on-id',
  defaultServeKey: 'on',
  enabled: true,
  environmentId: baseEnvironment.id,
  environmentKey: baseEnvironment.key,
  flag: {
    key: baseFlag.key,
    applicationId: baseApplication.id,
  },
  flagId: baseFlag.id,
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseVariationOn = {
  id: 'variation-on-id',
  flagId: baseFlag.id,
  key: 'on',
  value: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

const baseVariationOff = {
  id: 'variation-off-id',
  flagId: baseFlag.id,
  key: 'off',
  value: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

describe('featureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = createServiceWithMocks.featureFlag;
  });

  describe('createFeatureFlag', () => {
    const createPayload = {
      actor,
      applicationId,
      defaultVariationKey: 'on',
      description: 'new feature flag',
      enabled: true,
      key: 'new-flag',
      type: FeatureFlagType.Boolean,
      variations: {
        on: true,
        off: false,
      },
    };

    it('atomically creates the flag, its variations, a flag-environment row per env, and writes logs', async () => {
      const createdFlag = { ...baseFlag, id: 'flag-2', key: 'new-flag', description: createPayload.description };
      const createdVariationOn = { ...baseVariationOn, flagId: createdFlag.id };
      const createdVariationOff = { ...baseVariationOff, flagId: createdFlag.id };
      const otherEnvironment = { ...baseEnvironment, id: 'env-2', key: EnvironmentKey.Production };

      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(baseApplication);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([baseEnvironment, otherEnvironment]);
      vi.mocked(mockRepositories.featureFlagsRepository.create).mockResolvedValue(createdFlag);
      vi.mocked(mockRepositories.flagVariationsRepository.create)
        .mockResolvedValueOnce(createdVariationOn)
        .mockResolvedValueOnce(createdVariationOff);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.createMany).mockResolvedValue([
        {
          ...baseFlagEnvironment,
          flagId: createdFlag.id,
          defaultServeId: createdVariationOn.id,
          defaultServeKey: createdVariationOn.key,
        },
        {
          ...baseFlagEnvironment,
          flagId: createdFlag.id,
          environmentId: otherEnvironment.id,
          defaultServeId: createdVariationOn.id,
          defaultServeKey: createdVariationOn.key,
        },
      ]);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue({
        id: 'log-1',
        actorId: actor.id,
        action: ActionType.Create,
        applicationId,
        environmentId: baseEnvironment.id,
        subjectId: createdFlag.id,
        subjectKey: createdFlag.key,
        subjectType: SubjectType.FeatureFlag,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        oldData: null,
        newData: createdFlag,
      });

      const result = await service.createFeatureFlag(createPayload);

      expect(result).toEqual(createdFlag);
      expect(mockRepositories.applicationsRepository.findById).toHaveBeenCalledExactlyOnceWith(applicationId);
      expect(mockRepositories.featureFlagsRepository.create).toHaveBeenCalledExactlyOnceWith({
        applicationId,
        description: createPayload.description,
        key: createPayload.key,
        type: createPayload.type,
      });

      expect(mockRepositories.flagVariationsRepository.create).toHaveBeenCalledTimes(2);
      expect(mockRepositories.flagEnvironmentsRepository.createMany).toHaveBeenCalledExactlyOnceWith([
        {
          defaultServeId: createdVariationOn.id,
          enabled: createPayload.enabled,
          environmentId: baseEnvironment.id,
          flagId: createdFlag.id,
        },
        {
          defaultServeId: createdVariationOn.id,
          enabled: createPayload.enabled,
          environmentId: otherEnvironment.id,
          flagId: createdFlag.id,
        },
      ]);
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledTimes(5);
    });

    it('throws ValidationError when variations is empty', async () => {
      await expect(service.createFeatureFlag({ ...createPayload, variations: {} })).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError when object flag variations are not objects', async () => {
      await expect(
        service.createFeatureFlag({
          ...createPayload,
          type: FeatureFlagType.Object,
          variations: { on: 'not-json', off: {} },
        }),
      ).rejects.toThrow(ValidationError);

      expect(mockRepositories.featureFlagsRepository.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when defaultVariationKey is not present in variations', async () => {
      await expect(service.createFeatureFlag({ ...createPayload, defaultVariationKey: 'missing' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('throws NotFoundError when application does not exist', async () => {
      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(null);

      await expect(service.createFeatureFlag(createPayload)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listFeatureFlags', () => {
    const baseListParams = {
      filters: {},
      pagination: { page: 1, rows: 25 },
      sort: { direction: ColumnSortingDirection.ASC, field: 'key' as const },
    };

    it('returns an empty envelope when no flags match', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.featureFlagsRepository.count).mockResolvedValue(0);

      const result = await service.listFeatureFlags(baseListParams);

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 25,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });

    it('returns plain flags with metadata', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([baseFlag]);
      vi.mocked(mockRepositories.featureFlagsRepository.count).mockResolvedValue(1);

      const result = await service.listFeatureFlags(baseListParams);

      expect(result.data).toEqual([baseFlag]);
      expect(result.metadata).toEqual({
        page: 1,
        records: 1,
        rows: 25,
        totalPages: 1,
        totalRecords: 1,
      });
    });

    it('passes filters, pagination, and sort straight through to the repository', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([baseFlag]);
      vi.mocked(mockRepositories.featureFlagsRepository.count).mockResolvedValue(1);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          defaultServeId: 'serve-id',
          defaultServeKey: 'serve-key',
          enabled: true,
          environmentId: 'environment-id',
          environmentKey: EnvironmentKey.Development,
          flag: { applicationId: 'application-id', key: 'flag-key' },
          flagId: baseFlag.id,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);

      const filters = {
        applicationIds: [applicationId],
        createdAtStartDate: '2024-01-01',
        featureFlagTypes: [FeatureFlagType.Boolean],
        search: 'flag',
      };

      const result = await service.listFeatureFlags({ ...baseListParams, filters, with: { environments: true } });

      expect(mockRepositories.featureFlagsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters,
        pagination: { limit: 25, offset: 0 },
        sort: { direction: ColumnSortingDirection.ASC, field: 'key' },
      });
      expect(mockRepositories.featureFlagsRepository.count).toHaveBeenCalledExactlyOnceWith(filters);
      expect(result).toEqual({
        data: [
          {
            applicationId: 'app-1',
            applicationName: 'test-app',
            archived: false,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            deletedAt: null,
            description: 'feature flag description',
            enabled: {
              development: true,
            },
            id: 'flag-1',
            key: 'flag-key',
            type: 'boolean',
            updatedAt: new Date('2024-01-01T00:00:00Z'),
          },
        ],
        metadata: { page: 1, rows: 25, records: 1, totalPages: 1, totalRecords: 1 },
      });
    });

    it('keeps incoming flagIds when filtering by enabled only', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([baseFlag]);
      vi.mocked(mockRepositories.featureFlagsRepository.count).mockResolvedValue(1);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([baseFlagEnvironment]);

      await service.listFeatureFlags({
        ...baseListParams,
        filters: { enabled: true, flagIds: [baseFlag.id] },
      });

      expect(mockRepositories.featureFlagsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { flagIds: [baseFlag.id] },
        pagination: { limit: 25, offset: 0 },
        sort: { direction: ColumnSortingDirection.ASC, field: 'key' },
      });
      expect(mockRepositories.featureFlagsRepository.count).toHaveBeenCalledExactlyOnceWith({
        flagIds: [baseFlag.id],
      });
    });

    it('returns empty results when environmentKeys have no matching flags', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([]);

      const result = await service.listFeatureFlags({
        ...baseListParams,
        filters: { environmentKeys: [EnvironmentKey.Development] },
      });

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 25,
          totalPages: 0,
          totalRecords: 0,
        },
      });
      expect(mockRepositories.featureFlagsRepository.list).not.toHaveBeenCalled();
      expect(mockRepositories.featureFlagsRepository.count).not.toHaveBeenCalled();
    });
  });

  describe('countFeatureFlags', () => {
    it('delegates to featureFlagsRepository.count with the provided filters', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.count).mockResolvedValue(7);

      const filters = { featureFlagTypes: [FeatureFlagType.Boolean] };
      const result = await service.countFeatureFlags(filters);

      expect(result).toBe(7);
      expect(mockRepositories.featureFlagsRepository.count).toHaveBeenCalledExactlyOnceWith(filters);
    });
  });

  describe('getFeatureFlagByApplicationNameAndKey', () => {
    it('delegates to featureFlagsRepository.getByApplicationNameAndKey', async () => {
      const joinedFlag = { ...baseFlag, applicationName: baseApplication.name };
      vi.mocked(mockRepositories.featureFlagsRepository.getByApplicationNameAndKey).mockResolvedValue(joinedFlag);

      const result = await service.getFeatureFlagByApplicationNameAndKey(baseApplication.name, baseFlag.key);

      expect(result).toEqual(joinedFlag);
      expect(mockRepositories.featureFlagsRepository.getByApplicationNameAndKey).toHaveBeenCalledExactlyOnceWith(
        baseApplication.name,
        baseFlag.key,
      );
    });
  });

  describe('authorization', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockAssertCanWrite.mockRejectedValue(notAMemberError());
    });

    afterEach(() => {
      mockAssertCanWrite.mockReset();
    });

    describe('createFeatureFlag', () => {
      it('authorizes on the target application before writing', async () => {
        await expect(
          service.createFeatureFlag({
            actor: { id: 'user-1' },
            applicationId: 'app-1',
          } as unknown as CreateFeatureFlagPayload),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', 'app-1');
        expect(mockRepositories.featureFlagsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateFeatureFlag', () => {
      it('authorizes on the feature flag before writing', async () => {
        await expect(service.updateFeatureFlag('flag-1', {}, 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'featureFlag', 'flag-1');
        expect(mockRepositories.featureFlagsRepository.updateById).not.toHaveBeenCalled();
      });

      it('disables enabled environments and writes a single archive log when archiving', async () => {
        const archivedFlag = { ...baseFlag, archived: true };
        mockAssertCanWrite.mockResolvedValue(undefined);
        mockRepositories.featureFlagsRepository.getById.mockResolvedValue(baseFlag);
        mockRepositories.featureFlagsRepository.updateById.mockResolvedValue(archivedFlag);
        mockRepositories.flagEnvironmentsRepository.list.mockResolvedValue([
          baseFlagEnvironment,
          { ...baseFlagEnvironment, environmentId: 'env-2' },
        ]);
        mockRepositories.flagEnvironmentsRepository.updateMany.mockResolvedValue([]);

        const result = await service.updateFeatureFlag(baseFlag.id, { archived: true }, 'user-1');

        expect(result).toEqual(archivedFlag);
        expect(mockRepositories.flagEnvironmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
          filters: { enabled: true, flagIds: [baseFlag.id] },
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        });
        expect(mockRepositories.flagEnvironmentsRepository.updateMany).toHaveBeenCalledExactlyOnceWith([
          { flagId: baseFlag.id, environmentId: baseEnvironment.id, enabled: false },
          { flagId: baseFlag.id, environmentId: 'env-2', enabled: false },
        ]);
        expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ action: ActionType.Archive, subjectType: SubjectType.FeatureFlag }),
        );
      });

      it('propagates errors from disabling environments and writes no log', async () => {
        mockAssertCanWrite.mockResolvedValue(undefined);
        mockRepositories.featureFlagsRepository.getById.mockResolvedValue(baseFlag);
        mockRepositories.featureFlagsRepository.updateById.mockResolvedValue({ ...baseFlag, archived: true });
        mockRepositories.flagEnvironmentsRepository.list.mockResolvedValue([baseFlagEnvironment]);
        mockRepositories.flagEnvironmentsRepository.updateMany.mockRejectedValue(new Error('db down'));

        await expect(service.updateFeatureFlag(baseFlag.id, { archived: true }, 'user-1')).rejects.toThrow('db down');
        expect(mockRepositories.logsRepository.create).not.toHaveBeenCalled();
      });

      it('still archives and logs when no environments are enabled', async () => {
        const archivedFlag = { ...baseFlag, archived: true };
        mockAssertCanWrite.mockResolvedValue(undefined);
        mockRepositories.featureFlagsRepository.getById.mockResolvedValue(baseFlag);
        mockRepositories.featureFlagsRepository.updateById.mockResolvedValue(archivedFlag);
        mockRepositories.flagEnvironmentsRepository.list.mockResolvedValue([]);
        mockRepositories.flagEnvironmentsRepository.updateMany.mockResolvedValue([]);

        const result = await service.updateFeatureFlag(baseFlag.id, { archived: true }, 'user-1');

        expect(result).toEqual(archivedFlag);
        expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ action: ActionType.Archive }),
        );
      });

      it('does not touch environments when restoring', async () => {
        const archivedFlag = { ...baseFlag, archived: true };
        mockAssertCanWrite.mockResolvedValue(undefined);
        mockRepositories.featureFlagsRepository.getById.mockResolvedValue(archivedFlag);
        mockRepositories.featureFlagsRepository.updateById.mockResolvedValue(baseFlag);

        await service.updateFeatureFlag(baseFlag.id, { archived: false }, 'user-1');

        expect(mockRepositories.flagEnvironmentsRepository.list).not.toHaveBeenCalled();
        expect(mockRepositories.flagEnvironmentsRepository.updateMany).not.toHaveBeenCalled();
        expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ action: ActionType.Restore }),
        );
      });
    });
  });
});

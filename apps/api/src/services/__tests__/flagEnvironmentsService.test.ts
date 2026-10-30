// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionType, EnvironmentKey, FeatureFlagType, SubjectType } from 'shared-types';

import { ColumnSortingDirection } from '../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ForbiddenError, UnprocessableError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import type { FlagEnvironmentsService } from 'services/flagEnvironmentsService.js';

const flagId = 'flag-1';
const environmentId = 'env-1';
const applicationId = 'app-1';
const featureFlagKey = 'my-flag';
const userId = 'user-1';

const baseFlag = {
  applicationId,
  applicationName: 'application-name',
  archived: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
  description: 'feature flag description',
  id: flagId,
  key: featureFlagKey,
  type: FeatureFlagType.Boolean,
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseFlagEnvironment = {
  flagId,
  environmentId,
  enabled: false,
  defaultServeId: 'variation-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const baseVariation = {
  id: 'variation-1',
  flagId,
  key: 'on',
  value: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

const baseFlagEnvironmentJoined = {
  ...baseFlagEnvironment,
  defaultServeKey: baseVariation.key,
  environmentKey: EnvironmentKey.Development,
  flag: {
    applicationId: baseFlag.applicationId,
    key: baseFlag.key,
  },
};

describe('flagEnvironmentsService', () => {
  let service: FlagEnvironmentsService;

  beforeEach(() => {
    service = createServiceWithMocks.flagEnvironments;
  });

  describe('createFlagEnvironment', () => {
    it('creates and returns the row', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.create).mockResolvedValue(baseFlagEnvironmentJoined);

      const result = await service.createFlagEnvironment(baseFlagEnvironment, 'user-1');

      expect(result).toEqual(baseFlagEnvironmentJoined);
      expect(mockRepositories.flagEnvironmentsRepository.create).toHaveBeenCalledExactlyOnceWith(baseFlagEnvironment);
    });
  });

  describe('provisionForFlag', () => {
    const input = { applicationId: 'app-1', flagId: 'flag-1', defaultServeId: 'variation-1', enabled: true };
    const developmentEnvironment = {
      id: 'env-1',
      applicationId: input.applicationId,
      key: EnvironmentKey.Development,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };
    const productionEnvironment = { ...developmentEnvironment, id: 'env-2', key: EnvironmentKey.Production };

    it('lists every environment in the application with no pagination limit', async () => {
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([developmentEnvironment]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.createMany).mockResolvedValue([]);

      await service.provisionForFlag(input);

      expect(mockRepositories.environmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { applicationId: input.applicationId },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
    });

    it('creates one flag-environment row per environment seeded with the provided defaults', async () => {
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([
        developmentEnvironment,
        productionEnvironment,
      ]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.createMany).mockResolvedValue([]);

      await service.provisionForFlag(input);

      expect(mockRepositories.flagEnvironmentsRepository.createMany).toHaveBeenCalledExactlyOnceWith([
        {
          defaultServeId: input.defaultServeId,
          enabled: input.enabled,
          environmentId: developmentEnvironment.id,
          flagId: input.flagId,
        },
        {
          defaultServeId: input.defaultServeId,
          enabled: input.enabled,
          environmentId: productionEnvironment.id,
          flagId: input.flagId,
        },
      ]);
    });

    it('returns the created rows and passes an empty batch when there are no environments', async () => {
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.createMany).mockResolvedValue([]);

      const result = await service.provisionForFlag(input);

      expect(result).toEqual([]);
      expect(mockRepositories.flagEnvironmentsRepository.createMany).toHaveBeenCalledExactlyOnceWith([]);
    });
  });

  describe('findFlagEnvironment', () => {
    it('returns the row when found', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).mockResolvedValue(
        baseFlagEnvironmentJoined,
      );

      const result = await service.findFlagEnvironment(flagId, environmentId);

      expect(result).toEqual(baseFlagEnvironmentJoined);
      expect(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).toHaveBeenCalledExactlyOnceWith(
        flagId,
        environmentId,
      );
    });
  });

  describe('getFlagEnvironment', () => {
    it('delegates to the repository', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.getByFlagIdAndEnvironmentId).mockResolvedValue(
        baseFlagEnvironmentJoined,
      );

      const result = await service.getFlagEnvironment(flagId, environmentId);

      expect(result).toEqual(baseFlagEnvironmentJoined);
      expect(mockRepositories.flagEnvironmentsRepository.getByFlagIdAndEnvironmentId).toHaveBeenCalledExactlyOnceWith(
        flagId,
        environmentId,
      );
    });
  });

  describe('listFlagEnvironments', () => {
    const baseListParams = {
      filters: {},
      pagination: { page: 1, rows: 25 },
      sort: { direction: ColumnSortingDirection.ASC, field: 'createdAt' as const },
    };

    it('returns an empty envelope when no rows match', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.count).mockResolvedValue(0);

      const result = await service.listFlagEnvironments(baseListParams);

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 25,
          sort: 'createdAt:asc',
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });

    it('returns merged flag summaries with metadata', async () => {
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([baseFlagEnvironmentJoined]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.count).mockResolvedValue(1);

      const result = await service.listFlagEnvironments(baseListParams);

      expect(result.data).toEqual([
        {
          createdAt: baseFlag.createdAt,
          defaultServeId: baseFlagEnvironment.defaultServeId,
          defaultServeKey: baseVariation.key,
          enabled: baseFlagEnvironment.enabled,
          environmentId,
          environmentKey: baseFlagEnvironmentJoined.environmentKey,
          flagId,
          flag: {
            applicationId: baseFlag.applicationId,
            key: baseFlag.key,
          },
          updatedAt: baseFlag.updatedAt,
        },
      ]);
      expect(result.metadata).toEqual({
        page: 1,
        records: 1,
        rows: 25,
        sort: 'createdAt:asc',
        totalPages: 1,
        totalRecords: 1,
      });
    });
  });

  describe('updateFlagEnvironment', () => {
    it('updates the flag environment', async () => {
      const updatedFlagEnvironment = {
        ...baseFlagEnvironmentJoined,
        enabled: true,
        defaultServeId: 'variation-2',
      };
      const logEntry = {
        id: 'log-1',
        action: ActionType.Enable,
        actorId: userId,
        applicationId,
        environmentId,
        subjectId: flagId,
        subjectKey: featureFlagKey,
        subjectType: SubjectType.FeatureFlag,
        oldData: {
          defaultServeId: baseFlagEnvironment.defaultServeId,
          enabled: baseFlagEnvironment.enabled,
        },
        newData: {
          defaultServeId: updatedFlagEnvironment.defaultServeId,
          enabled: updatedFlagEnvironment.enabled,
        },
        createdAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue({
        ...baseVariation,
        id: 'variation-2',
        key: 'off',
        value: false,
      });
      vi.mocked(mockRepositories.flagEnvironmentsRepository.getByFlagIdAndEnvironmentId).mockResolvedValue(
        baseFlagEnvironmentJoined,
      );
      vi.mocked(mockRepositories.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId).mockResolvedValue(
        updatedFlagEnvironment,
      );
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue(logEntry);

      const result = await service.updateFlagEnvironment(
        flagId,
        environmentId,
        {
          enabled: true,
          defaultServeId: 'variation-2',
        },
        userId,
      );

      expect(result).toEqual(updatedFlagEnvironment);
      expect(mockRepositories.flagEnvironmentsRepository.getByFlagIdAndEnvironmentId).toHaveBeenCalledExactlyOnceWith(
        flagId,
        environmentId,
      );
      expect(
        mockRepositories.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId,
      ).toHaveBeenCalledExactlyOnceWith(flagId, environmentId, {
        enabled: true,
        defaultServeId: 'variation-2',
      });
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Enable,
        actorId: userId,
        applicationId,
        environmentId,
        newData: {
          defaultServeId: 'variation-2',
          defaultServeKey: updatedFlagEnvironment.defaultServeKey,
          enabled: true,
        },
        oldData: {
          defaultServeId: 'variation-1',
          defaultServeKey: baseFlagEnvironmentJoined.defaultServeKey,
          enabled: false,
        },
        subjectId: flagId,
        subjectKey: featureFlagKey,
        subjectType: SubjectType.FeatureFlagEnvironment,
      });
    });

    it('rejects a defaultServeId that belongs to another flag', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue({
        ...baseVariation,
        id: 'variation-other',
        flagId: 'some-other-flag',
      });

      await expect(
        service.updateFlagEnvironment(flagId, environmentId, { defaultServeId: 'variation-other' }, userId),
      ).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'defaultServeId', code: 'INVALID' }],
      });

      expect(mockRepositories.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId).not.toHaveBeenCalled();
    });

    it('rejects a defaultServeId that does not resolve to a variation', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(null);

      const error = await service
        .updateFlagEnvironment(flagId, environmentId, { defaultServeId: 'missing' }, userId)
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(UnprocessableError);
      expect(error).toMatchObject({ status: 422, errors: [{ field: 'defaultServeId', code: 'NOT_FOUND' }] });
      expect(mockRepositories.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId).not.toHaveBeenCalled();
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

    describe('createFlagEnvironment', () => {
      it('authorizes on the feature flag before writing', async () => {
        await expect(
          service.createFlagEnvironment(
            { flagId: 'flag-1', environmentId: 'env-1', defaultServeId: 'var-1', enabled: false },
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'featureFlag', 'flag-1');
        expect(mockRepositories.flagEnvironmentsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateFlagEnvironment', () => {
      it('authorizes on the feature flag before writing', async () => {
        await expect(service.updateFlagEnvironment('flag-1', 'env-1', {}, 'user-1')).rejects.toBeInstanceOf(
          ForbiddenError,
        );
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'featureFlag', 'flag-1');
        expect(mockRepositories.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId).not.toHaveBeenCalled();
      });
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApplicationsService } from '../applicationsService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ConflictError, NotFoundError } from '../../errors/AppError.js';
import { ForbiddenError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import { user } from 'test/setup.js';
import { EnvironmentKey, FeatureFlagType } from 'shared-types';

describe('createApplicationsService', () => {
  let service: ApplicationsService;

  const mockApplication = {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    description: 'A test application',
    id: 'app-1',
    name: 'test-app',
    teamId: 'team-1',
    teamName: 'team-name',
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    service = createServiceWithMocks.applications;
  });

  describe('create', () => {
    it('should create when name is available', async () => {
      vi.mocked(mockRepositories.applicationsRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepositories.applicationsRepository.create).mockResolvedValue(mockApplication);

      const input = { name: 'test-app', description: 'A test application', teamId: 'team-1' };
      const result = await service.createApplication(input, user.id);

      expect(result).toEqual(mockApplication);
      expect(mockRepositories.applicationsRepository.findByName).toHaveBeenCalledWith('test-app');
      expect(mockRepositories.applicationsRepository.create).toHaveBeenCalledWith(input);
    });

    it('should throw ConflictError when name already exists', async () => {
      vi.mocked(mockRepositories.applicationsRepository.findByName).mockResolvedValue(mockApplication);

      await expect(service.createApplication({ name: 'test-app', teamId: 'team-1' }, user.id)).rejects.toThrow(
        ConflictError,
      );
      expect(mockRepositories.applicationsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return application', async () => {
      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(mockApplication);

      const result = await service.findById('app-1');

      expect(result).toEqual(mockApplication);
      expect(mockRepositories.applicationsRepository.findById).toHaveBeenCalledWith('app-1');
    });

    it('should throw NotFoundError when not found', async () => {
      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getApplicationByName', () => {
    it('should return application when found', async () => {
      vi.mocked(mockRepositories.applicationsRepository.getByName).mockResolvedValue(mockApplication);

      const result = await service.getApplicationByName(mockApplication.name);

      expect(result).toEqual(mockApplication);
      expect(mockRepositories.applicationsRepository.getByName).toHaveBeenCalledExactlyOnceWith(mockApplication.name);
    });
  });

  describe('updateApplication', () => {
    it('should update and return the application', async () => {
      const updated = { ...mockApplication, description: 'Updated' };
      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(mockApplication);
      vi.mocked(mockRepositories.applicationsRepository.updateById).mockResolvedValue(updated);

      const result = await service.updateApplication('app-1', { description: 'Updated' }, user.id);

      expect(result).toEqual(updated);
      expect(mockRepositories.applicationsRepository.updateById).toHaveBeenCalledWith('app-1', {
        description: 'Updated',
      });
    });

    it('should throw NotFoundError when application does not exist', async () => {
      vi.mocked(mockRepositories.applicationsRepository.updateById).mockResolvedValue(null);

      await expect(service.updateApplication('non-existent', { description: 'Updated' }, user.id)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('deleteApplication', () => {
    it('soft deletes all application-owned resources and records their pre-delete state', async () => {
      const environment = {
        applicationId: 'app-1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        id: 'environment-1',
        key: EnvironmentKey.Development,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };
      const archivedFeatureFlag = {
        applicationId: 'app-1',
        applicationName: 'test-app',
        archived: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        description: 'An archived feature flag',
        id: 'flag-1',
        key: 'archived-flag',
        type: FeatureFlagType.Boolean,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };
      const segment = {
        applicationId: 'app-1',
        applicationName: 'test-app',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        description: 'A test segment',
        id: 'segment-1',
        key: 'segment-1',
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };
      const rule = {
        conditions: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        environmentId: environment.id,
        flagId: null,
        flagKey: null,
        id: 'rule-1',
        key: 'rule-1',
        orderPosition: 0,
        segmentId: segment.id,
        segmentKey: segment.key,
        serveFractional: null,
        serveFractionalId: null,
        serveVariationId: null,
        serveVariationKey: null,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(mockRepositories.applicationsRepository.findById).mockResolvedValue(mockApplication);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([environment]);
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([archivedFeatureFlag]);
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([rule]);
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([segment]);
      vi.mocked(mockRepositories.featureFlagsRepository.softDeleteMany).mockResolvedValue([archivedFeatureFlag]);
      vi.mocked(mockRepositories.rulesRepository.softDeleteMany).mockResolvedValue([rule]);
      vi.mocked(mockRepositories.segmentsRepository.softDeleteMany).mockResolvedValue([segment]);
      vi.mocked(mockRepositories.applicationsRepository.softDeleteById).mockResolvedValue(mockApplication);

      await service.deleteApplication('app-1', user.id);

      expect(mockRepositories.featureFlagsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { applicationIds: ['app-1'], include: { archived: true } },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.rulesRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { environmentIds: [environment.id] },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.rulesRepository.softDeleteMany).toHaveBeenCalledExactlyOnceWith([rule.id]);
      expect(mockRepositories.applicationsRepository.softDeleteById).toHaveBeenCalledExactlyOnceWith('app-1');
      expect(mockRepositories.logsRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ environmentId: environment.id, oldData: rule, subjectId: rule.id }),
          expect.objectContaining({ oldData: archivedFeatureFlag, subjectId: archivedFeatureFlag.id }),
        ]),
      );
    });
  });

  describe('listApplications', () => {
    it('fetches based on available params', async () => {
      const team = { id: '123', name: 'my-team', organizationId: 'org-1' };
      const teamsResult = [team];
      const applicationsResult = [mockApplication];
      const countResult = 1;

      vi.mocked(mockRepositories.teamsRepository.list).mockResolvedValue(teamsResult);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue(applicationsResult);
      vi.mocked(mockRepositories.applicationsRepository.count).mockResolvedValue(countResult);

      const result = await service.listApplications({
        pagination: { page: 1, rows: 10 },
        with: { teams: true },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: applicationsResult,
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
    });

    it('returns early if no applications', async () => {
      const countResult = 0;

      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.applicationsRepository.count).mockResolvedValue(countResult);

      const result = await service.listApplications({
        pagination: { page: 1, rows: 10 },
        with: { teams: true },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });

    it('returns applications with no teams', async () => {
      const applicationsResult = [mockApplication];
      const countResult = 1;

      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue(applicationsResult);
      vi.mocked(mockRepositories.applicationsRepository.count).mockResolvedValue(countResult);

      const result = await service.listApplications({
        pagination: { page: 1, rows: 10 },
        sort: { field: 'updatedAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: applicationsResult,
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
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

    describe('createApplication', () => {
      it('authorizes on the target team before writing', async () => {
        await expect(service.createApplication({ name: 'x', teamId: 'team-1' }, 'user-1')).rejects.toBeInstanceOf(
          ForbiddenError,
        );
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'team', 'team-1');
        expect(mockRepositories.applicationsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateApplication', () => {
      it('authorizes on the application before writing', async () => {
        await expect(service.updateApplication('app-1', { description: 'x' }, 'user-1')).rejects.toBeInstanceOf(
          ForbiddenError,
        );
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', 'app-1');
        expect(mockRepositories.applicationsRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('deleteApplication', () => {
      it('authorizes on the application before writing', async () => {
        await expect(service.deleteApplication('app-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', 'app-1');
        expect(mockRepositories.applicationsRepository.softDeleteById).not.toHaveBeenCalled();
        expect(mockRepositories.applicationsRepository.hardDeleteById).not.toHaveBeenCalled();
      });
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EnvironmentsService } from 'services/environmentsService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import { EnvironmentKey } from 'shared-types';

const baseEnvironment = {
  id: 'environment-id',
  applicationId: 'app-1',
  key: EnvironmentKey.Development,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};
const nonexistantEnvironmentId = 'nonexistent-id';

describe('environmentsService', () => {
  let service: EnvironmentsService;

  beforeEach(() => {
    service = createServiceWithMocks.environments;
  });

  describe('createEnvironment', () => {
    it('creates and returns environment', async () => {
      vi.mocked(mockRepositories.environmentsRepository.create).mockResolvedValue(baseEnvironment);

      const result = await service.createEnvironment(
        { applicationId: 'app-1', key: EnvironmentKey.Development },
        'user-1',
      );

      expect(result).toEqual(baseEnvironment);
      expect(mockRepositories.environmentsRepository.create).toHaveBeenCalledWith({
        applicationId: 'app-1',
        key: EnvironmentKey.Development,
      });
    });

    it('passes a repository ConflictError through unchanged', async () => {
      const conflict = new ConflictError({ message: 'dupe', detail: 'Already exists.' });
      vi.mocked(mockRepositories.environmentsRepository.create).mockRejectedValue(conflict);

      await expect(
        service.createEnvironment({ applicationId: 'app-1', key: EnvironmentKey.Development }, 'user-1'),
      ).rejects.toBe(conflict);
    });

    it('rethrows unexpected errors', async () => {
      vi.mocked(mockRepositories.environmentsRepository.create).mockRejectedValue(new Error('connection failed'));

      await expect(
        service.createEnvironment({ applicationId: 'app-1', key: EnvironmentKey.Development }, 'user-1'),
      ).rejects.toThrow('connection failed');
    });
  });

  describe('findEnvironmentById', () => {
    it('returns environment when found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.findById).mockResolvedValue(baseEnvironment);

      const result = await service.findEnvironmentById(baseEnvironment.id);

      expect(result).toEqual(baseEnvironment);
    });

    it('returns null when not found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.findById).mockResolvedValue(null);

      const result = await service.findEnvironmentById(nonexistantEnvironmentId);

      expect(result).toBeNull();
    });
  });

  describe('getEnvironmentById', () => {
    it('returns environment when found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.getById).mockResolvedValue(baseEnvironment);

      const result = await service.getEnvironmentById(baseEnvironment.id);

      expect(result).toEqual(baseEnvironment);
      expect(mockRepositories.environmentsRepository.getById).toHaveBeenCalledWith(baseEnvironment.id);
    });

    it('throws NotFoundError when not found', async () => {
      const expectedError = new NotFoundError({
        message: 'Environment not found',
        context: { id: nonexistantEnvironmentId },
      });
      vi.mocked(mockRepositories.environmentsRepository.getById).mockRejectedValue(expectedError);

      await expect(service.getEnvironmentById(nonexistantEnvironmentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('findEnvironmentByKey', () => {
    it('returns environment when found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.findByKey).mockResolvedValue(baseEnvironment);

      const result = await service.findEnvironmentByKey('app-1', EnvironmentKey.Development);

      expect(result).toEqual(baseEnvironment);
    });

    it('returns null when not found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.findByKey).mockResolvedValue(null);

      const result = await service.findEnvironmentByKey('app-1', EnvironmentKey.Development);

      expect(result).toBeNull();
    });
  });

  describe('getEnvironmentByKey', () => {
    it('returns environment when found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.getByKey).mockResolvedValue(baseEnvironment);

      const result = await service.getEnvironmentByKey('app-1', EnvironmentKey.Development);

      expect(result).toEqual(baseEnvironment);
      expect(mockRepositories.environmentsRepository.getByKey).toHaveBeenCalledWith(
        'app-1',
        EnvironmentKey.Development,
      );
    });

    it('throws NotFoundError when not found', async () => {
      const expectedError = new NotFoundError({
        message: 'Environment not found',
        context: { applicationId: 'app-1', key: EnvironmentKey.Development },
      });
      vi.mocked(mockRepositories.environmentsRepository.getByKey).mockRejectedValue(expectedError);

      await expect(service.getEnvironmentByKey('app-1', EnvironmentKey.Development)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listEnvironments', () => {
    it('returns environments for the application with metadata', async () => {
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([baseEnvironment]);
      vi.mocked(mockRepositories.environmentsRepository.count).mockResolvedValue(1);

      const result = await service.listEnvironments({
        filters: { applicationId: 'app-1' },
        pagination: { page: 1, rows: 10 },
        sort: {
          direction: ColumnSortingDirection.ASC,
          field: 'createdAt',
        },
      });

      expect(result).toEqual({
        data: [baseEnvironment],
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
      expect(mockRepositories.environmentsRepository.list).toHaveBeenCalledWith({
        filters: { applicationId: 'app-1' },
        pagination: { limit: 10, offset: 0 },
        sort: { direction: ColumnSortingDirection.ASC, field: 'createdAt' },
      });
      expect(mockRepositories.environmentsRepository.count).toHaveBeenCalledWith({
        applicationId: 'app-1',
      });
    });

    it('passes search, pagination, and sort options', async () => {
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.environmentsRepository.count).mockResolvedValue(0);

      const result = await service.listEnvironments({
        filters: { applicationId: 'app-1', search: 'dev' },
        pagination: { page: 2, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.ASC },
      });

      expect(result).toEqual({
        data: [],
        metadata: {
          page: 2,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
        },
      });
      expect(mockRepositories.environmentsRepository.list).toHaveBeenCalledWith({
        filters: { applicationId: 'app-1', search: 'dev' },
        pagination: { limit: 10, offset: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.ASC },
      });
      expect(mockRepositories.environmentsRepository.count).toHaveBeenCalledWith({
        applicationId: 'app-1',
        search: 'dev',
      });
    });
  });

  describe('updateEnvironment', () => {
    it('updates and returns environment', async () => {
      const updated = { ...baseEnvironment, key: EnvironmentKey.Development };
      vi.mocked(mockRepositories.environmentsRepository.updateById).mockResolvedValue(updated);

      const result = await service.updateEnvironment(baseEnvironment.id, { key: EnvironmentKey.Development }, 'user-1');

      expect(result).toEqual(updated);
      expect(mockRepositories.environmentsRepository.updateById).toHaveBeenCalledWith(baseEnvironment.id, {
        key: EnvironmentKey.Development,
      });
    });

    it('throws NotFoundError when not found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.updateById).mockResolvedValue(null);

      await expect(
        service.updateEnvironment(nonexistantEnvironmentId, { key: EnvironmentKey.Development }, 'user-1'),
      ).rejects.toThrow(NotFoundError);
    });

    it('passes a repository ConflictError through unchanged', async () => {
      const conflict = new ConflictError({ message: 'dupe', detail: 'Already exists.' });
      vi.mocked(mockRepositories.environmentsRepository.updateById).mockRejectedValue(conflict);

      await expect(
        service.updateEnvironment(baseEnvironment.id, { key: EnvironmentKey.Development }, 'user-1'),
      ).rejects.toBe(conflict);
    });

    it('rethrows unexpected errors', async () => {
      vi.mocked(mockRepositories.environmentsRepository.updateById).mockRejectedValue(new Error('connection failed'));

      await expect(
        service.updateEnvironment(baseEnvironment.id, { key: EnvironmentKey.Development }, 'user-1'),
      ).rejects.toThrow('connection failed');
    });
  });

  describe('deleteEnvironment', () => {
    it('deletes environment', async () => {
      vi.mocked(mockRepositories.environmentsRepository.hardDeleteById).mockResolvedValue(baseEnvironment);

      await service.deleteEnvironment(baseEnvironment.id, 'user-1');

      expect(mockRepositories.environmentsRepository.hardDeleteById).toHaveBeenCalledWith(baseEnvironment.id);
    });

    it('throws NotFoundError when not found', async () => {
      vi.mocked(mockRepositories.environmentsRepository.hardDeleteById).mockResolvedValue(null);

      await expect(service.deleteEnvironment(nonexistantEnvironmentId, 'user-1')).rejects.toThrow(NotFoundError);
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

    describe('createEnvironment', () => {
      it('authorizes on the target application before writing', async () => {
        await expect(
          service.createEnvironment({ applicationId: 'app-1', key: EnvironmentKey.Development }, 'user-1'),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', 'app-1');
        expect(mockRepositories.environmentsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateEnvironment', () => {
      it('authorizes on the environment before writing', async () => {
        await expect(
          service.updateEnvironment('env-1', { key: EnvironmentKey.Production }, 'user-1'),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'environment', 'env-1');
        expect(mockRepositories.environmentsRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('deleteEnvironment', () => {
      it('authorizes on the environment before writing', async () => {
        await expect(service.deleteEnvironment('env-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'environment', 'env-1');
        expect(mockRepositories.environmentsRepository.hardDeleteById).not.toHaveBeenCalled();
      });
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey } from 'shared-types';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import createEnvironmentsRepository from 'repositories/environmentsRepository.js';
import mockDb, { mockReturning, type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { EnvironmentsRepository } from '../environmentsRepository.js';
import { ConflictError, InternalError, NotFoundError } from '../../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { environments } from 'db/schema/environments.js';

const baseEnvironment = {
  id: '1',
  applicationId: 'app-1',
  key: EnvironmentKey.Development,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('environmentsRepository', () => {
  let repository: EnvironmentsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    repository = createEnvironmentsRepository(db);
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await repository.findOwningTeamId('env-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(environments.id, 'env-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await repository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns a new environment', async () => {
      mockReturning(methods, [baseEnvironment]);

      const result = await repository.create({ applicationId: 'app-1', key: EnvironmentKey.Development });

      expect(result).toEqual(baseEnvironment);
      expect(methods.values).toHaveBeenCalledWith({ applicationId: 'app-1', key: EnvironmentKey.Development });
    });

    it('throws InternalError when insert returns empty', async () => {
      mockReturning(methods, []);

      await expect(repository.create({ applicationId: 'app-1', key: EnvironmentKey.Development })).rejects.toThrow(
        InternalError,
      );
    });

    it('throws ConflictError on unique constraint violation', async () => {
      const uniqueError = new Error('unique violation') as Error & { code: string };
      uniqueError.code = '23505';
      methods.returning.mockRejectedValue(uniqueError);

      await expect(repository.create({ applicationId: 'app-1', key: EnvironmentKey.Development })).rejects.toThrow(
        ConflictError,
      );
      await expect(
        repository.create({ applicationId: 'app-1', key: EnvironmentKey.Development }),
      ).rejects.toMatchObject({
        status: 409,
        errors: [{ field: 'key', code: 'DUPLICATE' }],
      });
    });
  });

  describe('createMany', () => {
    it('creates each payload and returns the inserted rows', async () => {
      const productionEnvironment = {
        ...baseEnvironment,
        id: '2',
        key: EnvironmentKey.Production,
      };
      methods.returning.mockResolvedValueOnce([baseEnvironment]).mockResolvedValueOnce([productionEnvironment]);

      const payloads = [
        { applicationId: 'app-1', key: EnvironmentKey.Development },
        { applicationId: 'app-1', key: EnvironmentKey.Production },
      ];

      const result = await repository.createMany(payloads);

      expect(result).toEqual([baseEnvironment, productionEnvironment]);
      expect(methods.values).toHaveBeenNthCalledWith(1, payloads[0]);
      expect(methods.values).toHaveBeenNthCalledWith(2, payloads[1]);
    });

    it('returns empty when no payloads are provided', async () => {
      const result = await repository.createMany([]);

      expect(result).toEqual([]);
      expect(methods.insert).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns environment when found', async () => {
      methods.limit.mockResolvedValue([baseEnvironment]);

      const result = await repository.findById('1');

      expect(result).toEqual(baseEnvironment);
      expect(methods.where).toHaveBeenCalledWith(eq(environments.id, '1'));
      expect(methods.limit).toHaveBeenCalledWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByKey', () => {
    it('returns environment when found', async () => {
      methods.limit.mockResolvedValue([baseEnvironment]);

      const result = await repository.findByKey('app-1', EnvironmentKey.Development);

      expect(result).toEqual(baseEnvironment);
      expect(methods.where).toHaveBeenCalledWith(
        and(eq(environments.applicationId, 'app-1'), eq(environments.key, EnvironmentKey.Development)),
      );
      expect(methods.limit).toHaveBeenCalledWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.findByKey('app-1', EnvironmentKey.Development);

      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const applicationId = 'app-1';
      const search = 'dev';
      const keys = [EnvironmentKey.Development, EnvironmentKey.Production];
      const environmentIds = ['env-1', 'env-2'];

      await repository.list({
        filters: { applicationId, search, keys, environmentIds },
        pagination: { limit: 10, offset: 20 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          eq(environments.applicationId, applicationId),
          ilike(environments.key, `%${search}%`),
          inArray(environments.key, keys),
          inArray(environments.id, environmentIds),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params', async () => {
      await repository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(undefined);
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('updates and returns the environment', async () => {
      const updated = { ...baseEnvironment, key: EnvironmentKey.Development };
      mockReturning(methods, [updated]);

      const result = await repository.updateById('1', { key: EnvironmentKey.Development });

      expect(result).toEqual(updated);
      expect(methods.set).toHaveBeenCalledWith({ key: EnvironmentKey.Development });
      expect(methods.where).toHaveBeenCalledWith(eq(environments.id, '1'));
    });

    it('returns null when environment does not exist', async () => {
      mockReturning(methods, []);

      const result = await repository.updateById('999', { key: EnvironmentKey.Development });

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('throws NotFoundError when not found', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(repository.getById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('hardDeleteById', () => {
    it('deletes and returns the environment', async () => {
      mockReturning(methods, [baseEnvironment]);

      const result = await repository.hardDeleteById('1');

      expect(result).toEqual(baseEnvironment);
      expect(methods.where).toHaveBeenCalledWith(eq(environments.id, '1'));
    });

    it('returns null when environment does not exist', async () => {
      mockReturning(methods, []);

      const result = await repository.hardDeleteById('999');

      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('returns true when environment exists', async () => {
      methods.limit.mockResolvedValue([{ id: '1' }]);

      const result = await repository.exists('app-1', EnvironmentKey.Development);

      expect(result).toBe(true);
      expect(methods.where).toHaveBeenCalledWith(
        and(eq(environments.applicationId, 'app-1'), eq(environments.key, EnvironmentKey.Development)),
      );
    });

    it('returns false when environment does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.exists('app-1', EnvironmentKey.Development);

      expect(result).toBe(false);
    });
  });
});

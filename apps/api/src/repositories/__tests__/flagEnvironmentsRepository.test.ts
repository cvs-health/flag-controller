// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, eq, inArray } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvironmentKey } from 'shared-types';

import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ColumnSortingDirection } from '../../types/common.js';
import type { DbOrTx } from '../../types/db.js';

import type { FlagEnvironmentsRepository } from '../flagEnvironmentsRepository.js';
import { environments } from '../../db/schema/environments.js';
import { featureFlags } from '../../db/schema/featureFlags.js';
import { flagEnvironments } from '../../db/schema/flagEnvironments.js';
import { flagVariations } from '../../db/schema/flagVariations.js';
import createFlagEnvironmentsRepository from '../flagEnvironmentsRepository.js';
import mockDb, { mockReturning, type MockMethods } from '../../test/mockDb.js';
import { ConflictError, InternalError, NotFoundError } from '../../errors/AppError.js';

const baseFlagEnvironment = {
  flagId: 'flag-1',
  environmentId: 'env-1',
  enabled: false,
  defaultServeId: 'variation-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  environmentKey: EnvironmentKey.Development,
};

const baseFlagEnvironmentJoined = {
  ...baseFlagEnvironment,
  defaultVariation: 'on',
  flag: {
    applicationId: 'app-1',
    key: 'some-flag-key',
  },
};

describe('flagEnvironmentsRepository', () => {
  let repository: FlagEnvironmentsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    repository = createFlagEnvironmentsRepository(db);
  });

  describe('create', () => {
    it('inserts and returns the row', async () => {
      mockReturning(methods, [baseFlagEnvironment]);
      methods.limit.mockResolvedValue([baseFlagEnvironmentJoined]);

      const result = await repository.create(baseFlagEnvironment);

      expect(result).toEqual(baseFlagEnvironmentJoined);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(baseFlagEnvironment);
    });

    it('throws InternalError when insert returns empty', async () => {
      mockReturning(methods, []);

      await expect(repository.create(baseFlagEnvironment)).rejects.toThrow(InternalError);
    });

    it('throws ConflictError on unique violation', async () => {
      const uniqueError = new Error('unique violation') as Error & { code: string };
      uniqueError.code = '23505';
      methods.returning.mockRejectedValue(uniqueError);

      await expect(repository.create(baseFlagEnvironment)).rejects.toThrow(ConflictError);
    });
  });

  describe('createMany', () => {
    it('inserts every payload in a single call and returns the rows', async () => {
      const productionRow = { ...baseFlagEnvironment, environmentId: 'env-2' };
      mockReturning(methods, [baseFlagEnvironment, productionRow]);
      methods.limit
        .mockResolvedValueOnce([baseFlagEnvironmentJoined])
        .mockResolvedValueOnce([{ ...baseFlagEnvironmentJoined, environmentId: 'env-2' }]);

      const payloads = [baseFlagEnvironment, productionRow];
      const result = await repository.createMany(payloads);

      expect(result).toEqual([baseFlagEnvironmentJoined, { ...baseFlagEnvironmentJoined, environmentId: 'env-2' }]);
      expect(methods.values).toHaveBeenNthCalledWith(1, baseFlagEnvironment);
      expect(methods.values).toHaveBeenNthCalledWith(2, productionRow);
    });

    it('short-circuits and returns an empty array when given no payloads', async () => {
      const result = await repository.createMany([]);

      expect(result).toEqual([]);
      expect(methods.insert).not.toHaveBeenCalled();
    });

    it('throws ConflictError on unique violation', async () => {
      const uniqueError = new Error('unique violation') as Error & { code: string };
      uniqueError.code = '23505';
      methods.returning.mockRejectedValue(uniqueError);

      await expect(repository.createMany([baseFlagEnvironment])).rejects.toThrow(ConflictError);
    });
  });

  describe('findByFlagIdAndEnvironmentId', () => {
    it('joins environments, featureFlags, and the default variation and returns the row when found', async () => {
      methods.limit.mockResolvedValue([baseFlagEnvironmentJoined]);

      const result = await repository.findByFlagIdAndEnvironmentId('flag-1', 'env-1');

      expect(result).toEqual(baseFlagEnvironmentJoined);
      expect(methods.innerJoin).toHaveBeenNthCalledWith(
        1,
        environments,
        eq(environments.id, flagEnvironments.environmentId),
      );
      expect(methods.innerJoin).toHaveBeenNthCalledWith(2, featureFlags, eq(featureFlags.id, flagEnvironments.flagId));
      expect(methods.leftJoin).toHaveBeenCalledExactlyOnceWith(
        flagVariations,
        eq(flagVariations.id, flagEnvironments.defaultServeId),
      );
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(flagEnvironments.flagId, 'flag-1'), eq(flagEnvironments.environmentId, 'env-1')),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.findByFlagIdAndEnvironmentId('flag-1', 'env-missing');

      expect(result).toBeNull();
    });
  });

  describe('getByFlagIdAndEnvironmentId', () => {
    it('returns the row when found', async () => {
      methods.limit.mockResolvedValue([baseFlagEnvironmentJoined]);

      const result = await repository.getByFlagIdAndEnvironmentId('flag-1', 'env-1');

      expect(result).toEqual(baseFlagEnvironmentJoined);
    });

    it('throws NotFoundError when not found', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(repository.getByFlagIdAndEnvironmentId('flag-1', 'env-missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('lists flag environments with all optional filters', async () => {
      await repository.list({
        filters: {
          defaultServeIds: ['variation-1'],
          enabled: true,
          environmentIds: ['env-1'],
          flagIds: ['flag-1'],
        },
        pagination: { limit: 25, offset: 5 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(flagEnvironments.defaultServeId, ['variation-1']),
          eq(flagEnvironments.enabled, true),
          inArray(flagEnvironments.environmentId, ['env-1']),
          inArray(flagEnvironments.flagId, ['flag-1']),
        ),
      );
      expect(methods.innerJoin).toHaveBeenNthCalledWith(
        1,
        environments,
        eq(environments.id, flagEnvironments.environmentId),
      );
      expect(methods.innerJoin).toHaveBeenNthCalledWith(2, featureFlags, eq(featureFlags.id, flagEnvironments.flagId));
      expect(methods.leftJoin).toHaveBeenCalledExactlyOnceWith(
        flagVariations,
        eq(flagVariations.id, flagEnvironments.defaultServeId),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(25);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(5);
    });

    it('includes deleted and archived flags when requested', async () => {
      await repository.list({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and());
    });

    it('sorts by the joined environment key', async () => {
      await repository.list({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        sort: {
          field: 'environmentKey',
          direction: ColumnSortingDirection.ASC,
        },
      });

      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(environments.key);
    });

    it('lists flag environments when optional filters are omitted', async () => {
      await repository.list({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and());
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('updateByFlagIdAndEnvironmentId', () => {
    it('sets payload fields and filters by composite key', async () => {
      const updated = { ...baseFlagEnvironment, enabled: true };
      mockReturning(methods, [updated]);
      methods.limit.mockResolvedValue([{ ...baseFlagEnvironmentJoined, enabled: true }]);

      const result = await repository.updateByFlagIdAndEnvironmentId('flag-1', 'env-1', {
        enabled: true,
        defaultServeId: 'variation-1',
      });

      expect(result).toEqual({ ...baseFlagEnvironmentJoined, enabled: true });
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({
        enabled: true,
        defaultServeId: 'variation-1',
      });
      expect(methods.where).toHaveBeenNthCalledWith(
        1,
        and(eq(flagEnvironments.flagId, 'flag-1'), eq(flagEnvironments.environmentId, 'env-1')),
      );
      expect(methods.where).toHaveBeenNthCalledWith(
        2,
        and(eq(flagEnvironments.flagId, 'flag-1'), eq(flagEnvironments.environmentId, 'env-1')),
      );
    });

    it('throws NotFoundError when no row matches', async () => {
      mockReturning(methods, []);

      await expect(
        repository.updateByFlagIdAndEnvironmentId('flag-1', 'env-missing', { enabled: true }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateMany', () => {
    it('handles an empty payload', async () => {
      const result = await repository.updateMany([]);

      expect(result).toEqual([]);
      expect(methods.update).not.toHaveBeenCalled();
    });

    it('updates each row by its composite key and returns the updated rows', async () => {
      const updatedA = { ...baseFlagEnvironment, enabled: false };
      const updatedB = { ...baseFlagEnvironment, environmentId: 'env-2', enabled: false };
      methods.returning.mockResolvedValueOnce([updatedA]).mockResolvedValueOnce([updatedB]);

      const result = await repository.updateMany([
        { flagId: 'flag-1', environmentId: 'env-1', enabled: false },
        { flagId: 'flag-1', environmentId: 'env-2', enabled: false },
      ]);

      expect(result).toEqual([updatedA, updatedB]);
      expect(methods.set).toHaveBeenNthCalledWith(1, { enabled: false });
      expect(methods.set).toHaveBeenNthCalledWith(2, { enabled: false });
      expect(methods.where).toHaveBeenNthCalledWith(
        1,
        and(eq(flagEnvironments.flagId, 'flag-1'), eq(flagEnvironments.environmentId, 'env-1')),
      );
      expect(methods.where).toHaveBeenNthCalledWith(
        2,
        and(eq(flagEnvironments.flagId, 'flag-1'), eq(flagEnvironments.environmentId, 'env-2')),
      );
    });

    it('returns an empty array when no row matches', async () => {
      mockReturning(methods, []);

      const result = await repository.updateMany([{ flagId: 'flag-1', environmentId: 'env-missing', enabled: false }]);

      expect(result).toEqual([]);
    });
  });

  describe('exists', () => {
    it('returns true based on available params', async () => {
      methods.limit.mockResolvedValue([
        {
          flagId: 'flag-1',
          environmentId: 'env-1',
          enabled: true,
          defaultServeId: 'variation-1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);

      const result = await repository.exists({
        defaultServeIds: ['variation-1'],
        enabled: true,
        environmentIds: ['env-1'],
        flagIds: ['flag-1'],
      });

      expect(result).toEqual(true);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(flagEnvironments.defaultServeId, ['variation-1']),
          eq(flagEnvironments.enabled, true),
          inArray(flagEnvironments.environmentId, ['env-1']),
          inArray(flagEnvironments.flagId, ['flag-1']),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns false based on unavailable params', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.exists({
        enabled: false,
      });

      expect(result).toEqual(false);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(eq(flagEnvironments.enabled, false)));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });
  });
});

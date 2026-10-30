// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, eq, gte, ilike, inArray, isNull, lte, sql } from 'drizzle-orm';
import { FeatureFlagType } from 'shared-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import createFeatureFlagsRepository from 'repositories/featureFlagsRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { FeatureFlagsRepository } from '../featureFlagsRepository.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { InternalError, NotFoundError } from '../../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { applications } from 'db/schema/applications.js';
import { featureFlags } from 'db/schema/featureFlags.js';

const mockFeatureFlag = {
  id: 'flag-1',
  applicationId: 'app-1',
  key: 'test-flag',
  description: 'A test flag',
  type: FeatureFlagType.Boolean,
  archived: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('featureFlagsRepository', () => {
  let featureFlagsRepository: FeatureFlagsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    featureFlagsRepository = createFeatureFlagsRepository(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await featureFlagsRepository.findOwningTeamId('flag-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(featureFlags.id, 'flag-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await featureFlagsRepository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('findById', () => {
    it('handles successful find', async () => {
      methods.limit.mockResolvedValue([mockFeatureFlag]);

      const result = await featureFlagsRepository.findById(mockFeatureFlag.id);

      expect(result).toEqual(mockFeatureFlag);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(featureFlags.id, mockFeatureFlag.id));
    });

    it('handles no find when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await featureFlagsRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByKey', () => {
    it('handles successful find', async () => {
      methods.limit.mockResolvedValue([mockFeatureFlag]);

      const result = await featureFlagsRepository.findByKey(mockFeatureFlag.applicationId, mockFeatureFlag.key);

      expect(result).toEqual(mockFeatureFlag);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(featureFlags.key, mockFeatureFlag.key), eq(featureFlags.applicationId, mockFeatureFlag.applicationId)),
      );
    });

    it('handles no find when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await featureFlagsRepository.findByKey('app-1', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByApplicationNameAndKey', () => {
    it('handles successful find', async () => {
      methods.limit.mockResolvedValue([mockFeatureFlag]);

      const result = await featureFlagsRepository.findByApplicationNameAndKey('app-name', mockFeatureFlag.key);

      expect(result).toEqual(mockFeatureFlag);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(featureFlags.key, mockFeatureFlag.key), eq(applications.name, 'app-name')),
      );
    });

    it('handles no find when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await featureFlagsRepository.findByApplicationNameAndKey('app-name', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('handles successful retrieval', async () => {
      methods.limit.mockResolvedValue([mockFeatureFlag]);

      const result = await featureFlagsRepository.getById(mockFeatureFlag.id);

      expect(result).toEqual(mockFeatureFlag);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(featureFlags.id, mockFeatureFlag.id));
    });

    it('handles no retrieval when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(featureFlagsRepository.getById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getByApplicationNameAndKey', () => {
    it('handles successful retrieval', async () => {
      methods.limit.mockResolvedValue([mockFeatureFlag]);

      const result = await featureFlagsRepository.getByApplicationNameAndKey('app-name', mockFeatureFlag.key);

      expect(result).toEqual(mockFeatureFlag);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(featureFlags.key, mockFeatureFlag.key), eq(applications.name, 'app-name')),
      );
    });

    it('handles no retrieval when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(featureFlagsRepository.getByApplicationNameAndKey('app-name', 'non-existent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const flagIds = ['flag-1', 'flag-2'];
      const keys = ['flag-key-1', 'flag-key-2'];
      const search = 'flag-search';

      await featureFlagsRepository.list({
        filters: {
          applicationIds,
          flagIds,
          keys,
          createdAtStartDate: '2024-01-01',
          createdAtEndDate: '2024-12-31',
          featureFlagTypes: [FeatureFlagType.Boolean],
          updatedAtStartDate: '2024-01-01',
          updatedAtEndDate: '2024-12-31',
          search,
          include: { deleted: false, archived: false },
        },
        pagination: { limit: 10, offset: 20 },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(featureFlags.deletedAt),
          eq(featureFlags.archived, false),
          inArray(featureFlags.type, [FeatureFlagType.Boolean]),
          gte(featureFlags.createdAt, new Date('2024-01-01')),
          lte(featureFlags.createdAt, new Date('2024-12-31')),
          gte(featureFlags.updatedAt, new Date('2024-01-01')),
          lte(featureFlags.updatedAt, new Date('2024-12-31')),
          inArray(featureFlags.applicationId, applicationIds),
          inArray(featureFlags.id, flagIds),
          inArray(featureFlags.key, keys),
          ilike(featureFlags.key, `%${search}%`),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('sorts by the joined application name', async () => {
      await featureFlagsRepository.list({
        pagination: { limit: 10, offset: 0 },
        sort: {
          field: 'applicationName',
          direction: ColumnSortingDirection.ASC,
        },
      });

      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(applications.name);
    });

    it('fetches based on unavailable params', async () => {
      await featureFlagsRepository.list({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(isNull(featureFlags.deletedAt), eq(featureFlags.archived, false)),
      );
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });

    it('filters to only archived flags when archived is true', async () => {
      await featureFlagsRepository.list({
        filters: { archived: true },
        pagination: { limit: 10, offset: 0 },
        sort: {
          field: 'key',
          direction: ColumnSortingDirection.ASC,
        },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(isNull(featureFlags.deletedAt), eq(featureFlags.archived, true)),
      );
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const flagIds = ['flag-1', 'flag-2'];
      const keys = ['flag-key-1', 'flag-key-2'];

      await featureFlagsRepository.count({
        applicationIds,
        flagIds,
        keys,
        featureFlagTypes: [FeatureFlagType.Boolean],
        include: { deleted: false, archived: false },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(featureFlags.deletedAt),
          eq(featureFlags.archived, false),
          inArray(featureFlags.type, [FeatureFlagType.Boolean]),
          inArray(featureFlags.applicationId, applicationIds),
          inArray(featureFlags.id, flagIds),
          inArray(featureFlags.key, keys),
        ),
      );
    });

    it('fetches based on unavailable params', async () => {
      await featureFlagsRepository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(isNull(featureFlags.deletedAt), eq(featureFlags.archived, false)),
      );
    });
  });

  describe('create', () => {
    const payload = {
      applicationId: 'app-1',
      key: 'new-flag',
      description: 'A new flag',
      type: FeatureFlagType.Boolean,
    };

    it('handles a successful create', async () => {
      const featureFlag = { ...mockFeatureFlag };

      methods.returning.mockResolvedValueOnce([featureFlag]);
      const result = await featureFlagsRepository.create(payload);

      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(featureFlag);
    });

    it('handles a failed create', async () => {
      await expect(featureFlagsRepository.create(payload)).rejects.toThrow(InternalError);
    });
  });

  describe('updateById', () => {
    it('handles successful update', async () => {
      const payload = { description: 'Updated description', archived: true };
      const updated = { ...mockFeatureFlag, ...payload };

      methods.returning.mockResolvedValue([updated]);
      methods.limit.mockResolvedValue([updated]);

      const result = await featureFlagsRepository.updateById(mockFeatureFlag.id, payload);

      expect(result).toEqual(updated);
      expect(methods.where).toHaveBeenCalledTimes(2);
      expect(methods.where).toHaveBeenCalledWith(eq(featureFlags.id, mockFeatureFlag.id));
      expect(methods.set).toHaveBeenCalledExactlyOnceWith(payload);
    });

    it('throws NotFoundError when no row matches', async () => {
      methods.returning.mockResolvedValue([]);

      await expect(featureFlagsRepository.updateById('non-existent', { description: 'Updated' })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('softDeleteMany', () => {
    it('soft deletes multiple feature flags and returns the deleted flags', async () => {
      const flagIds = ['flag-1', 'flag-2'];
      const deletedFlags = [
        { ...mockFeatureFlag, id: 'flag-1' },
        { ...mockFeatureFlag, id: 'flag-2' },
      ];
      methods.for.mockResolvedValueOnce(deletedFlags);

      const result = await featureFlagsRepository.softDeleteMany(flagIds);

      expect(result).toEqual(deletedFlags);
      expect(methods.where).toHaveBeenNthCalledWith(1, inArray(featureFlags.id, flagIds));
      expect(methods.for).toHaveBeenCalledExactlyOnceWith('update');
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ deletedAt: sql`now()` });
      expect(methods.where).toHaveBeenNthCalledWith(2, inArray(featureFlags.id, flagIds));
    });
  });
});

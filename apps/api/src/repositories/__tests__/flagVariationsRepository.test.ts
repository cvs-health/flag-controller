// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import createFlagVariationsRepository from 'repositories/flagVariationsRepository.js';
import mockDb, { mockReturning, type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import { InternalError, NotFoundError } from '../../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { flagVariations } from 'db/schema/flagVariations.js';
import { ColumnSortingDirection } from '../../types/common.js';

const mockVariation = {
  createdAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  flagId: 'flag-1',
  id: 'var-1',
  key: 'on',
  updatedAt: '2024-01-01T00:00:00Z',
  value: true,
};

describe('flagVariationsRepository', () => {
  let repository: ReturnType<typeof createFlagVariationsRepository>;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    repository = createFlagVariationsRepository(db);
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await repository.findOwningTeamId('var-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(flagVariations.id, 'var-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await repository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('create', () => {
    it('handles a successful create', async () => {
      mockReturning(methods, [mockVariation]);

      const payload = { flagId: 'flag-1', key: 'on', value: true };
      const result = await repository.create(payload);

      expect(result).toEqual(mockVariation);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
    });

    it('handles a failed create', async () => {
      mockReturning(methods, []);

      const payload = { flagId: 'flag-1', key: 'on', value: true };

      await expect(repository.create(payload)).rejects.toThrow(InternalError);
    });
  });

  describe('findById', () => {
    it('returns variation when found', async () => {
      methods.limit.mockResolvedValue([mockVariation]);

      const result = await repository.findById('var-1');

      expect(result).toEqual(mockVariation);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(flagVariations.id, 'var-1'));
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns variation when found', async () => {
      methods.limit.mockResolvedValue([mockVariation]);

      const result = await repository.getById('var-1');

      expect(result).toEqual(mockVariation);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(flagVariations.id, 'var-1'));
    });

    it('throws NotFoundError when variation does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(repository.getById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateById', () => {
    it('handles successful update', async () => {
      const updated = { ...mockVariation, key: 'off', value: false };
      mockReturning(methods, [updated]);

      const result = await repository.updateById('var-1', { key: 'off', value: false });

      expect(result).toEqual(updated);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({
        key: 'off',
        value: false,
      });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(flagVariations.id, 'var-1'));
    });

    it('throws NotFoundError when variation does not exist', async () => {
      mockReturning(methods, []);

      await expect(repository.updateById('non-existent', { key: 'off' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDeleteById', () => {
    it('handles successful soft delete', async () => {
      const deleted = { ...mockVariation, deletedAt: '2024-01-02T00:00:00Z' };
      mockReturning(methods, [deleted]);

      const result = await repository.softDeleteById('var-1');

      expect(result).toEqual(deleted);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ deletedAt: sql`now()` });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(flagVariations.id, 'var-1'));
    });

    it('throws NotFoundError when variation does not exist', async () => {
      mockReturning(methods, []);

      await expect(repository.softDeleteById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const ids = ['var-1', 'var-2'];
      const flagIds = ['flag-1'];
      const keys = ['on', 'off'];

      await repository.list({
        filters: { ids, flagIds, keys, include: { deleted: false } },
        pagination: { limit: 10, offset: 20 },
        sort: { field: 'value', direction: ColumnSortingDirection.ASC },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(flagVariations.deletedAt),
          inArray(flagVariations.id, ids),
          inArray(flagVariations.flagId, flagIds),
          inArray(flagVariations.key, keys),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(flagVariations.value);
    });

    it('fetches based on unavailable params', async () => {
      await repository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(flagVariations.deletedAt)));
      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(flagVariations.key);
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const ids = ['var-1', 'var-2'];
      const flagIds = ['flag-1'];
      const keys = ['on', 'off'];

      await repository.count({ ids, flagIds, keys, include: { deleted: false } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(flagVariations.deletedAt),
          inArray(flagVariations.id, ids),
          inArray(flagVariations.flagId, flagIds),
          inArray(flagVariations.key, keys),
        ),
      );
    });

    it('fetches based on unavailable params', async () => {
      await repository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(flagVariations.deletedAt)));
    });
  });

  describe('exists', () => {
    it('returns true when variation exists', async () => {
      methods.limit.mockResolvedValue([mockVariation]);

      const result = await repository.exists({
        ids: ['var-1'],
        flagIds: ['flag-1'],
        keys: ['on'],
        include: { deleted: false },
      });

      expect(result).toEqual(true);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(flagVariations.deletedAt),
          inArray(flagVariations.id, ['var-1']),
          inArray(flagVariations.flagId, ['flag-1']),
          inArray(flagVariations.key, ['on']),
        ),
      );
    });

    it('returns false when variation does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.exists({});

      expect(result).toEqual(false);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(flagVariations.deletedAt)));
    });
  });
});

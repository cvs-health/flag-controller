// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, FractionalType, type FractionalWeight } from 'shared-types';
import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { fractionals } from 'db/schema/fractionals.js';

import createFractionalsRepository from 'repositories/fractionalsRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { InternalError, NotFoundError } from '../../errors/AppError.js';

const mockFractional = {
  id: 'fractional-1',
  type: FractionalType.WeightOnly,
  var: 'targetingKey',
  weights: [
    ['on', 50],
    ['off', 50],
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
};

describe('fractionalsRepository', () => {
  let repository: ReturnType<typeof createFractionalsRepository>;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    [db, methods] = mockDb();
    repository = createFractionalsRepository(db);
  });

  describe('create', () => {
    it('handles a successful create', async () => {
      const payload = {
        type: FractionalType.WeightOnly,
        var: 'targetingKey',
        weights: [
          ['on', 50],
          ['off', 50],
        ] as FractionalWeight[],
      };

      methods.returning.mockResolvedValueOnce([mockFractional]);

      const result = await repository.create(payload);

      expect(result).toEqual(mockFractional);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
    });

    it('handles a failed create', async () => {
      const payload = {
        type: FractionalType.WeightOnly,
        var: 'targetingKey',
        weights: [['on', 100]] as FractionalWeight[],
      };

      methods.returning.mockResolvedValueOnce([]);

      await expect(repository.create(payload)).rejects.toThrow(InternalError);
    });
  });

  describe('findById', () => {
    it('returns fractional when found', async () => {
      methods.limit.mockResolvedValue([mockFractional]);

      const result = await repository.findById('fractional-1');

      expect(result).toEqual(mockFractional);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(fractionals.id, 'fractional-1'));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns fractional when found', async () => {
      methods.limit.mockResolvedValue([mockFractional]);

      const result = await repository.getById('fractional-1');

      expect(result).toEqual(mockFractional);
    });

    it('throws NotFoundError when not found', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(repository.getById('non-existent')).rejects.toThrow(NotFoundError);
      await expect(repository.getById('non-existent')).rejects.toMatchObject({
        code: ErrorCode.NotFound,
        status: 404,
        detail: 'Fractional not found.',
      });
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const fractionalIds = ['fractional-1', 'fractional-2'];

      await repository.list({
        filters: { fractionalIds, include: { deleted: false } },
        pagination: { limit: 10, offset: 20 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(isNull(fractionals.deletedAt), inArray(fractionals.id, fractionalIds)),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params', async () => {
      await repository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(fractionals.deletedAt)));
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteById', () => {
    it('returns updated fractional when found', async () => {
      const deleted = { ...mockFractional, deletedAt: '2024-01-02T00:00:00Z' };
      methods.returning.mockResolvedValueOnce([deleted]);

      const result = await repository.softDeleteById('fractional-1');

      expect(result).toEqual(deleted);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ deletedAt: sql`now()` });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(fractionals.id, 'fractional-1'));
    });

    it('returns null when fractional does not exist', async () => {
      methods.returning.mockResolvedValueOnce([]);

      const result = await repository.softDeleteById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('hardDeleteById', () => {
    it('returns deleted fractional when found', async () => {
      methods.returning.mockResolvedValueOnce([mockFractional]);

      const result = await repository.hardDeleteById('fractional-1');

      expect(result).toEqual(mockFractional);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(fractionals.id, 'fractional-1'));
    });

    it('returns null when fractional does not exist', async () => {
      methods.returning.mockResolvedValueOnce([]);

      const result = await repository.hardDeleteById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateById', () => {
    it('handles a successful update', async () => {
      const payload = {
        type: FractionalType.Contextual,
        var: 'userId',
        weights: [
          ['on', 25],
          ['off', 75],
        ] as FractionalWeight[],
      };
      const updated = { ...mockFractional, ...payload };

      methods.returning.mockResolvedValueOnce([updated]);

      const result = await repository.updateById('fractional-1', payload);

      expect(result).toEqual(updated);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(fractionals.id, 'fractional-1'));
      expect(methods.set).toHaveBeenCalledExactlyOnceWith(payload);
    });

    it('throws NotFoundError when update returns no rows', async () => {
      const payload = {
        type: FractionalType.WeightOnly,
        var: 'targetingKey',
        weights: [['on', 100]] as FractionalWeight[],
      };

      methods.returning.mockResolvedValueOnce([]);

      await expect(repository.updateById('non-existent', payload)).rejects.toThrow(NotFoundError);
    });
  });
});

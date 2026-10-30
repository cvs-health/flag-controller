// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { and, desc, eq, ilike, inArray, isNull, sql } from 'drizzle-orm';

import createSegmentsRepository from 'repositories/segmentsRepository.js';
import mockDb, { mockReturning, type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { SegmentsRepository } from '../segmentsRepository.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ConflictError, InternalError, NotFoundError } from '../../errors/AppError.js';
import { applications } from 'db/schema/applications.js';
import { rules } from 'db/schema/rules.js';
import { segments } from 'db/schema/segments.js';
import { ColumnSortingDirection } from '../../types/common.js';

const mockSegment = {
  id: 'segment-1',
  key: 'segment-key',
  description: 'A test segment',
  applicationId: 'app-1',
  applicationName: 'test-app',
  flagTargetCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('segmentsRepository', () => {
  let segmentsRepository: SegmentsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    segmentsRepository = createSegmentsRepository(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await segmentsRepository.findOwningTeamId('segment-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(segments.id, 'segment-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await segmentsRepository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const segmentIds = ['segment-1'];

      await segmentsRepository.list({
        filters: {
          applicationIds,
          segmentIds,
          include: { deleted: false },
          search: 'seg-key',
        },
        pagination: { limit: 10, offset: 20 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.ASC },
      });

      // Root query assertions (segments list)
      expect(methods.innerJoin).toHaveBeenCalledExactlyOnceWith(
        applications,
        eq(segments.applicationId, applications.id),
      );
      expect(methods.$with).not.toHaveBeenCalled();
      expect(methods.crossJoin).not.toHaveBeenCalled();
      expect(methods.groupBy).not.toHaveBeenCalled();
      expect(methods.leftJoin).not.toHaveBeenCalled();
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(segments.deletedAt),
          inArray(segments.applicationId, applicationIds),
          inArray(segments.id, segmentIds),
          ilike(segments.key, '%seg-key%'),
        ),
      );

      // Root query pagination/sort assertions
      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(segments.createdAt);
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on available params with flagTargetCount', async () => {
      const applicationIds = ['app-1'];
      const segmentIds = ['segment-1'];

      await segmentsRepository.list({
        filters: {
          applicationIds,
          segmentIds,
          include: { deleted: false },
          search: 'seg-key',
        },
        pagination: { limit: 10, offset: 20 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.ASC },
        with: { flagTargetCount: true },
      });

      // CTE query assertions (flag_counts)
      expect(methods.$with).toHaveBeenCalledExactlyOnceWith('flag_counts');
      expect(methods.crossJoin).toHaveBeenCalledExactlyOnceWith(expect.anything());
      expect(methods.where).toHaveBeenNthCalledWith(1, isNull(rules.deletedAt));
      expect(methods.groupBy).toHaveBeenCalledExactlyOnceWith(expect.anything());

      // Root query assertions (segments list)
      expect(methods.innerJoin).toHaveBeenCalledExactlyOnceWith(
        applications,
        eq(segments.applicationId, applications.id),
      );
      expect(methods.leftJoin).toHaveBeenCalledExactlyOnceWith(methods.as.mock.results[0].value, expect.anything());
      expect(methods.where).toHaveBeenNthCalledWith(
        2,
        and(
          isNull(segments.deletedAt),
          inArray(segments.applicationId, applicationIds),
          inArray(segments.id, segmentIds),
          ilike(segments.key, '%seg-key%'),
        ),
      );

      // Root query pagination/sort assertions
      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(segments.createdAt);
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params without flagTargetCount', async () => {
      await segmentsRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      // Root query assertions (segments list)
      expect(methods.$with).not.toHaveBeenCalled();
      expect(methods.crossJoin).not.toHaveBeenCalled();
      expect(methods.groupBy).not.toHaveBeenCalled();
      expect(methods.leftJoin).not.toHaveBeenCalled();
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(segments.deletedAt)));

      // Root query pagination/sort assertions
      expect(methods.orderBy).toHaveBeenCalledExactlyOnceWith(desc(segments.updatedAt));
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const segmentIds = ['segment-1'];
      methods.where.mockResolvedValue([{ count: 5 }]);

      const result = await segmentsRepository.count({
        filters: { applicationIds, segmentIds, include: { deleted: false } },
      });

      expect(result).toBe(5);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(segments.deletedAt),
          inArray(segments.applicationId, applicationIds),
          inArray(segments.id, segmentIds),
        ),
      );
    });

    it('fetches based on unavailable params', async () => {
      const result = await segmentsRepository.count();

      expect(result).toBe(0);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(segments.deletedAt)));
    });
  });

  describe('findById', () => {
    it('selects by id', async () => {
      methods.limit.mockResolvedValue([mockSegment]);

      const result = await segmentsRepository.findById('segment-1');

      expect(result).toEqual(mockSegment);
      expect(methods.innerJoin).toHaveBeenCalledExactlyOnceWith(
        applications,
        eq(segments.applicationId, applications.id),
      );
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(segments.id, 'segment-1'));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await segmentsRepository.findById('segment-1');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('selects by id', async () => {
      methods.limit.mockResolvedValue([mockSegment]);

      const result = await segmentsRepository.getById('segment-1');

      expect(result).toEqual(mockSegment);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(segments.id, 'segment-1'));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('throws NotFoundError when segment is not found', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(segmentsRepository.getById('missing-segment')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('handles a successful create', async () => {
      mockReturning(methods, [mockSegment]);

      const payload = { applicationId: 'app-1', key: 'segment-key', description: 'A test segment' };
      const result = await segmentsRepository.create(payload);

      expect(result).toEqual(mockSegment);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
    });

    it('handles a failed create', async () => {
      mockReturning(methods, []);

      const payload = { applicationId: 'app-1', key: 'segment-key', description: 'A test segment' };

      await expect(segmentsRepository.create(payload)).rejects.toThrow(InternalError);
    });
  });

  describe('createMany', () => {
    it('handles a successful creation', async () => {
      const payloads = [
        { applicationId: 'app-1', key: 'segment-key', description: 'A test segment' },
        { applicationId: 'app-1', key: 'segment-key-2', description: 'Another test segment' },
      ];

      await segmentsRepository.createMany(payloads);

      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payloads);
    });

    it('returns empty when no payloads are provided', async () => {
      const result = await segmentsRepository.createMany([]);

      expect(result).toEqual([]);
      expect(methods.insert).not.toHaveBeenCalled();
    });

    it('throws ConflictError on unique violation', async () => {
      const uniqueError = new Error('unique violation') as Error & { code: string };
      uniqueError.code = '23505';
      methods.returning.mockRejectedValue(uniqueError);

      await expect(
        segmentsRepository.createMany([{ applicationId: 'app-1', key: 'segment-key', description: 'A test segment' }]),
      ).rejects.toMatchObject({ status: 409, errors: [{ field: 'key', code: 'DUPLICATE' }] });
      await expect(
        segmentsRepository.createMany([{ applicationId: 'app-1', key: 'segment-key', description: 'A test segment' }]),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('findByKey', () => {
    it('returns segment when found', async () => {
      methods.limit.mockResolvedValue([mockSegment]);

      const result = await segmentsRepository.findByKey('app-1', 'segment-key');

      expect(result).toEqual(mockSegment);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(segments.applicationId, 'app-1'), eq(segments.key, 'segment-key')),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await segmentsRepository.findByKey('app-1', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByApplicationNameAndKey', () => {
    it('returns segment when found', async () => {
      methods.limit.mockResolvedValue([mockSegment]);

      const result = await segmentsRepository.findByApplicationNameAndKey('test-app', 'segment-key');

      expect(result).toEqual(mockSegment);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(applications.name, 'test-app'), eq(segments.key, 'segment-key')),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns null when not found', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await segmentsRepository.findByApplicationNameAndKey('test-app', 'missing');

      expect(result).toBeNull();
    });
  });

  describe('getByApplicationNameAndKey', () => {
    it('returns segment when found', async () => {
      methods.limit.mockResolvedValue([mockSegment]);

      const result = await segmentsRepository.getByApplicationNameAndKey('test-app', 'segment-key');

      expect(result).toEqual(mockSegment);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(eq(applications.name, 'test-app'), eq(segments.key, 'segment-key')),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('throws NotFoundError when segment is not found', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(segmentsRepository.getByApplicationNameAndKey('test-app', 'missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('returns true when segment exists', async () => {
      methods.limit.mockResolvedValue([{ id: 'segment-1' }]);

      const result = await segmentsRepository.exists({
        applicationIds: ['app-1'],
        segmentIds: ['segment-1'],
        include: { deleted: false },
        search: 'segment',
      });

      expect(result).toBe(true);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(segments.deletedAt),
          inArray(segments.applicationId, ['app-1']),
          inArray(segments.id, ['segment-1']),
          ilike(segments.key, '%segment%'),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns false when segment does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await segmentsRepository.exists({});

      expect(result).toBe(false);
    });
  });

  describe('updateById', () => {
    it('handles successful update', async () => {
      const updated = { ...mockSegment, description: 'Updated description' };
      mockReturning(methods, [updated]);

      const result = await segmentsRepository.updateById('segment-1', { description: 'Updated description' });

      expect(result).toEqual(updated);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({
        description: 'Updated description',
      });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(segments.id, 'segment-1'));
    });

    it('returns null when segment does not exist', async () => {
      mockReturning(methods, []);

      const result = await segmentsRepository.updateById('non-existent', { description: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('softDeleteMany', () => {
    it('soft deletes multiple segments and returns the deleted segments', async () => {
      const segmentIds = ['segment-1', 'segment-2'];
      const deletedSegments = [
        { ...mockSegment, id: 'segment-1' },
        { ...mockSegment, id: 'segment-2' },
      ];
      methods.for.mockResolvedValueOnce(deletedSegments);

      const result = await segmentsRepository.softDeleteMany(segmentIds);

      expect(result).toEqual(deletedSegments);
      expect(methods.innerJoin).toHaveBeenCalledExactlyOnceWith(
        applications,
        eq(segments.applicationId, applications.id),
      );
      expect(methods.where).toHaveBeenNthCalledWith(1, inArray(segments.id, segmentIds));
      expect(methods.for).toHaveBeenCalledExactlyOnceWith('update', { of: segments });
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ deletedAt: sql`now()` });
      expect(methods.where).toHaveBeenNthCalledWith(2, inArray(segments.id, segmentIds));
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SegmentsService } from '../segmentsService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { ForbiddenError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import { user } from 'test/setup.js';

describe('createSegmentsService', () => {
  let service: SegmentsService;

  const testSegment = {
    id: 'segment-1',
    key: 'test-segment',
    applicationId: 'app-1',
    applicationName: 'test-app',
    flagTargetCount: 0,
    description: 'Test segment',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };

  beforeEach(() => {
    service = createServiceWithMocks.segments;
  });

  describe('createSegment', () => {
    it('creates a segment when key does not exist', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findByKey).mockResolvedValue(null);
      vi.mocked(mockRepositories.segmentsRepository.create).mockResolvedValue(testSegment);

      const payload = { applicationId: 'app-1', key: 'test-segment', description: 'Test segment' };
      const result = await service.createSegment(payload, 'user-1');

      expect(mockRepositories.segmentsRepository.findByKey).toHaveBeenCalledExactlyOnceWith('app-1', 'test-segment');
      expect(mockRepositories.segmentsRepository.create).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(testSegment);
    });

    it('throws ConflictError when segment key already exists', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findByKey).mockResolvedValue(testSegment);

      const payload = { applicationId: 'app-1', key: 'test-segment', description: 'Test segment' };

      await expect(service.createSegment(payload, user.id)).rejects.toThrow('Segment with this key already exists');
      expect(mockRepositories.segmentsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('listSegments', () => {
    it('fetches based on available params', async () => {
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([testSegment]);
      vi.mocked(mockRepositories.segmentsRepository.count).mockResolvedValue(11);

      const filters = {
        applicationIds: ['app-1'],
        segmentIds: ['segment-1'],
        include: { deleted: false },
        search: 'test123',
      };
      const result = await service.listSegments({
        filters,
        pagination: { page: 2, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.segmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters,
        pagination: {
          limit: 10,
          offset: 10,
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
      });
      expect(mockRepositories.segmentsRepository.count).toHaveBeenCalledExactlyOnceWith({
        filters,
      });
      expect(result).toEqual({
        data: [testSegment],
        metadata: {
          page: 2,
          records: 1,
          rows: 10,
          totalPages: 2,
          totalRecords: 11,
          search: 'test123',
          sort: 'createdAt:desc',
        },
      });
    });

    it('fetches based on unavailable params', async () => {
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.segmentsRepository.count).mockResolvedValue(0);

      const result = await service.listSegments({
        pagination: { page: 1, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.segmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: undefined,
        pagination: {
          limit: 10,
          offset: 0,
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
      });
      expect(mockRepositories.segmentsRepository.count).toHaveBeenCalledExactlyOnceWith({
        filters: undefined,
      });
      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
          sort: 'createdAt:desc',
        },
      });
    });
  });

  describe('findSegmentById', () => {
    it('returns segment when found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findById).mockResolvedValue(testSegment);

      const result = await service.findSegmentById('segment-1');

      expect(mockRepositories.segmentsRepository.findById).toHaveBeenCalledExactlyOnceWith('segment-1');
      expect(result).toEqual(testSegment);
    });

    it('returns null when segment is not found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findById).mockResolvedValue(null);

      const result = await service.findSegmentById('segment-1');

      expect(result).toBeNull();
    });
  });

  describe('findSegmentByKey', () => {
    it('returns segment when found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findByKey).mockResolvedValue(testSegment);

      const result = await service.findSegmentByKey('app-1', 'test-segment');

      expect(mockRepositories.segmentsRepository.findByKey).toHaveBeenCalledExactlyOnceWith('app-1', 'test-segment');
      expect(result).toEqual(testSegment);
    });

    it('returns null when not found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.findByKey).mockResolvedValue(null);

      const result = await service.findSegmentByKey('app-1', 'non-existent');

      expect(mockRepositories.segmentsRepository.findByKey).toHaveBeenCalledExactlyOnceWith('app-1', 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getSegmentByApplicationNameAndKey', () => {
    it('returns segment when found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.getByApplicationNameAndKey).mockResolvedValue(testSegment);

      const result = await service.getSegmentByApplicationNameAndKey('test-app', 'test-segment');

      expect(mockRepositories.segmentsRepository.getByApplicationNameAndKey).toHaveBeenCalledExactlyOnceWith(
        'test-app',
        'test-segment',
      );
      expect(result).toEqual(testSegment);
    });

    it('throws when segment is not found', async () => {
      vi.mocked(mockRepositories.segmentsRepository.getByApplicationNameAndKey).mockRejectedValue(
        new Error('Segment with applicationName test-app and key test-segment not found'),
      );

      await expect(service.getSegmentByApplicationNameAndKey('test-app', 'test-segment')).rejects.toThrow(
        'Segment with applicationName test-app and key test-segment not found',
      );
    });
  });

  describe('updateSegment', () => {
    it('updates and returns segment', async () => {
      const updated = { ...testSegment, description: 'Updated description' };
      vi.mocked(mockRepositories.segmentsRepository.findById).mockResolvedValue(testSegment);
      vi.mocked(mockRepositories.segmentsRepository.updateById).mockResolvedValue(updated);

      const payload = { description: 'Updated description' };
      const result = await service.updateSegment('segment-1', payload, 'user-1');

      expect(mockRepositories.segmentsRepository.updateById).toHaveBeenCalledExactlyOnceWith('segment-1', payload);
      expect(result).toEqual(updated);
    });

    it('throws NotFoundError when segment does not exist', async () => {
      vi.mocked(mockRepositories.segmentsRepository.updateById).mockResolvedValue(null);

      const payload = { description: 'Updated description' };

      await expect(service.updateSegment('non-existent', payload, 'user-1')).rejects.toThrow('Segment not found');
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

    describe('createSegment', () => {
      it('authorizes on the target application before writing', async () => {
        await expect(
          service.createSegment({ applicationId: 'app-1', key: 'k', description: 'd' }, 'user-1'),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', 'app-1');
        expect(mockRepositories.segmentsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('createManySegments', () => {
      it('authorizes the full application id set before writing', async () => {
        await expect(
          service.createManySegments(
            [
              { applicationId: 'app-1', key: 'k1', description: 'd' },
              { applicationId: 'app-2', key: 'k2', description: 'd' },
            ],
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'application', ['app-1', 'app-2']);
        expect(mockRepositories.segmentsRepository.createMany).not.toHaveBeenCalled();
      });
    });

    describe('updateSegment', () => {
      it('authorizes on the segment before writing', async () => {
        await expect(service.updateSegment('seg-1', {}, 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'segment', 'seg-1');
        expect(mockRepositories.segmentsRepository.updateById).not.toHaveBeenCalled();
      });
    });
  });
});

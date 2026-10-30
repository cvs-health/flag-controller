// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { applications } from 'db/schema/applications.js';
import { and, eq, ilike, inArray, isNull } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import createApplicationsRepository from 'repositories/applicationsRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { ApplicationsRepository } from '../applicationsRepository.js';
import type { DbOrTx } from '../../types/db.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { ConflictError, InternalError, NotFoundError } from '../../errors/AppError.js';

const mockApplication = {
  id: 'app-1',
  name: 'test-app',
  description: 'A test application',
  teamId: 'team-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('applicationsRepository', () => {
  let applicationsRepository: ApplicationsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    applicationsRepository = createApplicationsRepository(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await applicationsRepository.findOwningTeamId('app-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, 'app-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await applicationsRepository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('findById', () => {
    it('handles successful find', async () => {
      methods.limit.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.findById(mockApplication.id);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, mockApplication.id));
    });

    it('handles no find when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await applicationsRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('handles successful find', async () => {
      methods.limit.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.findByName(mockApplication.name);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.name, mockApplication.name));
    });

    it('handles no find when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await applicationsRepository.findByName('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('hardDeleteById', () => {
    it('handles successful deletion', async () => {
      methods.returning.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.hardDeleteById(mockApplication.id);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, mockApplication.id));
    });

    it('handles no deletion when entry does not exist', async () => {
      methods.returning.mockResolvedValue([]);

      await expect(applicationsRepository.hardDeleteById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('softDeleteById', () => {
    it('handles successful deletion', async () => {
      methods.returning.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.softDeleteById(mockApplication.id);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, mockApplication.id));
    });

    it('handles no deletion when entry does not exist', async () => {
      methods.returning.mockResolvedValue([]);

      await expect(applicationsRepository.softDeleteById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getById', () => {
    it('handles successful retrieval', async () => {
      methods.limit.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.getById(mockApplication.id);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, mockApplication.id));
    });

    it('handles no retrieval when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(applicationsRepository.getById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getByName', () => {
    it('handles successful retrieval', async () => {
      methods.limit.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.getByName(mockApplication.name);

      expect(result).toEqual(mockApplication);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.name, mockApplication.name));
    });

    it('handles no retrieval when entry does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      await expect(applicationsRepository.getByName('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const teamIds = ['123'];
      const names = ['appplication-name'];
      const search = 'search-term';

      await applicationsRepository.list({
        filters: { teamIds, names, search, include: { deleted: false } },
        pagination: { limit: 10, offset: 20 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          isNull(applications.deletedAt),
          inArray(applications.teamId, teamIds),
          inArray(applications.name, names),
          ilike(applications.name, `%${search}%`),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params', async () => {
      await applicationsRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(applications.deletedAt)));
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const teamIds = ['123'];

      await applicationsRepository.count({ teamIds, include: { deleted: false } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(isNull(applications.deletedAt), inArray(applications.teamId, teamIds)),
      );
    });

    it('fetches based on unavailable params', async () => {
      await applicationsRepository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(applications.deletedAt)));
    });
  });

  describe('create', () => {
    const payload = { name: 'name', teamId: 'team-1' };

    it('handles a successful create', async () => {
      const application = { id: 'application-id' };

      methods.returning.mockResolvedValueOnce([application]);
      const result = await applicationsRepository.create(payload);

      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(application);
    });

    it('handles a failed create', async () => {
      await expect(applicationsRepository.create(payload)).rejects.toThrow(InternalError);
    });

    it('maps a unique violation to a 409 naming the field', async () => {
      const uniqueError = new Error('unique violation') as Error & { code: string };
      uniqueError.code = '23505';
      methods.returning.mockRejectedValueOnce(uniqueError);

      const error = await applicationsRepository.create(payload).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ConflictError);
      expect(error).toMatchObject({
        status: 409,
        errors: [{ field: 'name', code: 'DUPLICATE' }],
      });
    });
  });

  describe('updateById', () => {
    it('returns the updated application', async () => {
      methods.returning.mockResolvedValue([mockApplication]);

      const result = await applicationsRepository.updateById(mockApplication.id, { description: 'Updated' });

      expect(result).toEqual(mockApplication);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ description: 'Updated' });
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(applications.id, mockApplication.id));
    });

    it('returns null when the application does not exist', async () => {
      methods.returning.mockResolvedValue([]);

      expect(await applicationsRepository.updateById('non-existent', { description: 'Updated' })).toBeNull();
    });
  });
});

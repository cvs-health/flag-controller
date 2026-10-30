// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, inArray } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { users } from 'db/schema/auth.js';
import createUsersRepository from 'repositories/usersRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import type { DbOrTx } from '../../types/db.js';
import type { UsersRepository } from '../usersRepository.js';

describe('usersRepository', () => {
  let usersRepository: UsersRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    usersRepository = createUsersRepository(db);
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const params = { pagination: { limit: 10, offset: 10 }, filters: { userIds: ['user-1', 'user-2'] } };

      await usersRepository.list(params);

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(inArray(users.id, params.filters.userIds)));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(params.pagination.limit);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(params.pagination.offset);
    });

    it('fetches based on unavailable params', async () => {
      await usersRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(undefined);
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const userIds = ['user-1', 'user-2'];

      await usersRepository.count({ filters: { userIds } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(inArray(users.id, userIds)));
    });

    it('fetch based on unavailable params', async () => {
      await usersRepository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(undefined);
    });
  });
});

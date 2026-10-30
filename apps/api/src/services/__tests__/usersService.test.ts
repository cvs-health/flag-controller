// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UsersService } from '../usersService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';

describe('createUsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = createServiceWithMocks.users;
  });

  it('lists users with pagination and sorting', async () => {
    const users = [
      {
        id: 'user-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];

    vi.mocked(mockRepositories.usersRepository.list).mockResolvedValue(users);
    vi.mocked(mockRepositories.usersRepository.count).mockResolvedValue(5);

    const result = await service.listUsers({
      pagination: { page: 2, rows: 10 },
      sort: { field: 'name', direction: ColumnSortingDirection.ASC },
    });

    expect(mockRepositories.usersRepository.list).toHaveBeenCalledExactlyOnceWith({
      pagination: { limit: 10, offset: 10 },
      sort: { field: 'name', direction: ColumnSortingDirection.ASC },
    });
    expect(mockRepositories.usersRepository.count).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(result).toEqual({
      data: users,
      metadata: {
        page: 2,
        records: 1,
        rows: 10,
        totalPages: 1,
        totalRecords: 5,
      },
    });
  });
});

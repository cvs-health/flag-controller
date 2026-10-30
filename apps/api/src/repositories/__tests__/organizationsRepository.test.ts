// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import createOrganizationsRepository from 'repositories/organizationsRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { OrganizationsRepository } from '../organizationsRepository.js';
import { DEFAULT_ORGANIZATION } from '../../constants/organizations.js';
import { organizations } from 'db/schema/auth.js';

describe('organizationsRepository', () => {
  let organizationsRepository: OrganizationsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    organizationsRepository = createOrganizationsRepository(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getBySlug', () => {
    it('returns organization when organization exists', async () => {
      methods.limit.mockResolvedValue([{ id: 'org-1', name: DEFAULT_ORGANIZATION.name }]);

      const result = await organizationsRepository.getBySlug(DEFAULT_ORGANIZATION.slug);

      expect(result).toEqual({ id: 'org-1', name: DEFAULT_ORGANIZATION.name });
      expect(db.select).toHaveBeenCalledWith({ id: organizations.id, name: organizations.name });
      expect(methods.where).toHaveBeenCalledWith(eq(organizations.slug, DEFAULT_ORGANIZATION.slug));
      expect(methods.limit).toHaveBeenCalledWith(1);
    });

    it('returns null when organization does not exist', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await organizationsRepository.getBySlug(DEFAULT_ORGANIZATION.slug);

      expect(result).toEqual(null);
      expect(methods.where).toHaveBeenCalledWith(eq(organizations.slug, DEFAULT_ORGANIZATION.slug));
      expect(methods.limit).toHaveBeenCalledWith(1);
    });
  });
});

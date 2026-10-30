// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';
import type { OrganizationsService } from '../organizationsService.js';
import { DEFAULT_ORGANIZATION } from '../../constants/organizations.js';
describe('createOrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(() => {
    service = createServiceWithMocks.organizations;
  });

  describe('getBySlug', () => {
    it('returns organization from repository', async () => {
      vi.mocked(mockRepositories.organizationsRepository.getBySlug).mockResolvedValue({
        id: 'org-1',
        name: DEFAULT_ORGANIZATION.name,
      });

      await service.getBySlug(DEFAULT_ORGANIZATION.slug);

      expect(mockRepositories.organizationsRepository.getBySlug).toHaveBeenCalledOnce();
    });

    it('returns null when repository does not the organization', async () => {
      vi.mocked(mockRepositories.organizationsRepository.getBySlug).mockResolvedValue(null);

      const result = await service.getBySlug(DEFAULT_ORGANIZATION.slug);

      expect(result).toEqual(null);
      expect(mockRepositories.organizationsRepository.getBySlug).toHaveBeenCalledOnce();
    });
  });
});

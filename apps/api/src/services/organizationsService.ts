// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ServiceDependencies } from '../types/services.js';

export type OrganizationsService = ReturnType<typeof createOrganizationsService>;

function createOrganizationsService({ repositories }: ServiceDependencies) {
  return {
    getBySlug: async (slug: string) => {
      return await repositories.organizationsRepository.getBySlug(slug);
    },
  };
}

export default createOrganizationsService;

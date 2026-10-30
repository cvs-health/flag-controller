// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { eq } from 'drizzle-orm';

import type { DbOrTx } from '../types/db.js';
import { organizations } from 'db/schema/auth.js';

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationsRepository = ReturnType<typeof createOrganizationsRepository>;

function createOrganizationsRepository(db: DbOrTx) {
  return {
    getBySlug: async (slug: string) => {
      const [organization = null] = await db
        .select({ id: organizations.id, name: organizations.name })
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);

      return organization;
    },
  };
}

export default createOrganizationsRepository;

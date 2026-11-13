// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { createContext, type ReactNode, use } from 'react';
import type { IdentityModes } from 'shared-types';

import useGetApiConfigQuery from '../../api/queries/useGetApiConfigQuery';

export const localModes: IdentityModes = {
  users: 'local',
  teams: 'local',
  memberships: 'local',
  applications: 'local',
};

// Until the API answers, entities count as local: the API still refuses writes the IdP owns.
export const IdentityModesContext = createContext(localModes);

export function IdentityModesProvider({ children }: { children: ReactNode }) {
  const getApiConfigQuery = useGetApiConfigQuery();

  return <IdentityModesContext value={getApiConfigQuery.data?.modes ?? localModes}>{children}</IdentityModesContext>;
}

/** Whether the identity provider owns this entity, so Flag Controller hides its create, edit and delete controls. */
export function useIsIdentityManaged(entity: Exclude<keyof IdentityModes, 'users'>) {
  return use(IdentityModesContext)[entity] === 'external';
}

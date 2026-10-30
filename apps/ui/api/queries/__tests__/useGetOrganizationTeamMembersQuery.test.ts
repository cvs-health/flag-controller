// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useGetOrganizationTeamMembersQuery from '../useGetOrganizationTeamMembersQuery';
import TestQueryClientProvider from '../../../test/TestQueryClientProvider';

const mocks = vi.hoisted(() => ({
  listTeamMembers: vi.fn().mockResolvedValue({}),
}));
vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({
    organization: {
      listTeamMembers: mocks.listTeamMembers,
    },
  }),
}));

describe('useGetOrganizationTeamMembersQuery', () => {
  it('should call the proper api', async () => {
    const teamId = 'team-id';

    renderHook(() => useGetOrganizationTeamMembersQuery(teamId), {
      wrapper: TestQueryClientProvider,
    });

    expect(mocks.listTeamMembers).toHaveBeenCalledExactlyOnceWith({ query: { teamId }, fetchOptions: { throw: true } });
  });
});

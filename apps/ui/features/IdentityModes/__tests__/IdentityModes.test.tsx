// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { IdentityModesProvider, useIsIdentityManaged } from '../IdentityModes';

function TeamsOwner() {
  return <p>{useIsIdentityManaged('teams') ? 'IdP owns teams' : 'Flag Controller owns teams'}</p>;
}

function renderWithProvider() {
  render(
    <TestQueryClientProvider>
      <IdentityModesProvider>
        <TeamsOwner />
      </IdentityModesProvider>
    </TestQueryClientProvider>,
  );
}

describe('IdentityModesProvider', () => {
  it('reports the modes from /api/config', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({
        authProviders: [{ id: 'corp', kind: 'oidc' }],
        features: {},
        modes: { users: 'external', teams: 'external', memberships: 'external', applications: 'local' },
      }),
    );
    renderWithProvider();

    expect(await screen.findByText('IdP owns teams')).toBeInTheDocument();
  });

  it('treats every entity as local until the API answers', () => {
    vi.spyOn(global, 'fetch').mockReturnValueOnce(new Promise(() => {}));
    renderWithProvider();

    expect(screen.getByText('Flag Controller owns teams')).toBeInTheDocument();
  });
});

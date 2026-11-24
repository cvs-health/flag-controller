// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { MembersTable } from '../MembersTable';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/teams/payments-platform',
  useSearchParams: () => new URLSearchParams(),
}));

const member = {
  id: 'bJB6nVXAOQeYlunWrVSOWuTAQFfdl6Ck',
  name: 'Ada Lovelace',
  email: 'ada.lovelace@contoso.com',
};

function renderMembersTable(teams: 'local' | 'external') {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    resolvePromiseWithData({ data: [member], metadata: { totalRecords: 1 } }),
  );
  render(
    <TestProviders identityModes={{ teams }}>
      <MembersTable teamId="b7Rt3Wz8YcD1" />
    </TestProviders>,
  );
}

describe('MembersTable', () => {
  it('offers add and remove when Flag Controller manages memberships', async () => {
    renderMembersTable('local');

    expect(await screen.findByText(member.email)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add members' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeInTheDocument();
    expect(screen.queryByText('Managed by your identity provider')).not.toBeInTheDocument();
  });

  it('replaces add and remove with a note when the identity provider manages memberships', async () => {
    renderMembersTable('external');

    expect(await screen.findByText(member.email)).toBeInTheDocument();
    expect(screen.getByText('Managed by your identity provider')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add members' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Action' })).not.toBeInTheDocument();
  });
});

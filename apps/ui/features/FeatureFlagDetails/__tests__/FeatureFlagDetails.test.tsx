// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlagDetails } from '../FeatureFlagDetails';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';

const mocks = vi.hoisted(() => ({
  getBooleanValue: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

describe('FeatureFlagDetails', () => {
  const applicationName = 'applicationName';
  const teamName = 'team-name';

  it('should render', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [], metadata: { totalRecords: 0 } }));
    render(
      <TestProviders>
        <FeatureFlagDetails
          applicationName={applicationName}
          featureFlagKey="feature-flag-key"
          teamName={teamName}
          featureFlagId="feature-flag-id"
        />
      </TestProviders>,
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getAllByText('Application').length).toBeGreaterThan(0);
    expect(screen.getByText(teamName)).toBeInTheDocument();
    expect(screen.getByText(applicationName)).toBeInTheDocument();
  });
});

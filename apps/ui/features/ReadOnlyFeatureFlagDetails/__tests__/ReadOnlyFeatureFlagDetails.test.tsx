// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ReadOnlyFeatureFlagDetails } from '../ReadOnlyFeatureFlagDetails';

describe('ReadOnlyFeatureFlagDetails', () => {
  it('should render', () => {
    const applicationName = 'applicationName';
    const teamName = 'teamName';

    render(
      <ReadOnlyFeatureFlagDetails
        teamName={teamName}
        applicationName={applicationName}
        featureFlagId="feature-flag-id"
      />,
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getAllByText('Application').length).toBeGreaterThan(0);
    expect(screen.getByText(teamName)).toBeInTheDocument();
    expect(screen.getByText(applicationName)).toBeInTheDocument();
  });
});

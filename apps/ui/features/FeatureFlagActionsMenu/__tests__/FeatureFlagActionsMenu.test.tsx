// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { MenuButton } from '@carbon/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeatureFlagActionsMenu } from '../FeatureFlagActionsMenu';
import TestProviders from '../../../test/TestProviders';

// Mock the dynamic import to return MenuButton directly
vi.mock('next/dynamic', () => ({
  default: () => MenuButton,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('FeatureFlagActionsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows archive option when clicked', async () => {
    render(
      <TestProviders>
        <FeatureFlagActionsMenu
          applicationId="application-id"
          featureFlagKey="test-flag"
          featureFlagId="feature-flag-id"
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Actions'));

    expect(screen.getAllByText('Archive flag').length).toBeGreaterThan(0);
  });
});

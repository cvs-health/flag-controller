// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlagsTableActions } from '../FeatureFlagsTableActions';

describe('FeatureFlagsTableActions', () => {
  it('should open the archive modal from the overflow menu', async () => {
    render(
      <TestProviders>
        <FeatureFlagsTableActions
          applicationId="application-id"
          featureFlagId="flag-id"
          featureFlagKey="flag-key"
          onArchived={vi.fn()}
        />
      </TestProviders>,
    );
    const modal = document.getElementById('archiveFeatureFlag-flag-id');

    expect(modal).not.toHaveClass('is-visible');

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByText('Archive flag'));

    expect(modal).toHaveClass('is-visible');
    expect(screen.getByText('"flag-key"')).toBeInTheDocument();
  });
});

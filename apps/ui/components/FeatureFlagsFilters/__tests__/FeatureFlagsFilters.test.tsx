// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeatureFlagsFilters } from '../FeatureFlagsFilters';

const initialFilters = {
  archived: false,
  createdAtEndDate: '',
  createdAtStartDate: '',
  enabledIn: [],
  featureFlagTypes: [],
  updatedAtEndDate: '',
  updatedAtStartDate: '',
};

describe('FeatureFlagsFilters', () => {
  it('should handle applying filters', async () => {
    const onApplyFilters = vi.fn();

    render(<FeatureFlagsFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    fireEvent.click(screen.getByLabelText('Filtering'));
    fireEvent.click(screen.getByText('Boolean'));
    fireEvent.click(screen.getByText('Development'));
    fireEvent.click(screen.getByText('Archived only'));
    fireEvent.click(screen.getByText('Apply filters'));

    await waitFor(() => {
      expect(onApplyFilters).toHaveBeenCalledExactlyOnceWith({
        archived: true,
        enabled: true,
        environmentKey: ['development'],
        featureFlagTypes: ['boolean'],
      });
    });

    fireEvent.click(screen.getByLabelText('Filtering'));

    expect(screen.getByLabelText('Boolean')).toBeChecked();
    expect(screen.getByLabelText('Development')).toBeChecked();
    expect(screen.getByLabelText('Archived only')).toBeChecked();
  });

  it('should reset selected filters when resetting', async () => {
    const onApplyFilters = vi.fn();

    render(<FeatureFlagsFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    fireEvent.click(screen.getByLabelText('Filtering'));
    fireEvent.click(screen.getByText('Boolean'));
    fireEvent.click(screen.getByText('Development'));

    expect(screen.getByLabelText('Boolean')).toBeChecked();
    expect(screen.getByLabelText('Development')).toBeChecked();

    fireEvent.click(screen.getByText('Reset filters'));

    await waitFor(() => {
      expect(screen.getByLabelText('Boolean')).not.toBeChecked();
      expect(screen.getByLabelText('Development')).not.toBeChecked();
    });
  });
});

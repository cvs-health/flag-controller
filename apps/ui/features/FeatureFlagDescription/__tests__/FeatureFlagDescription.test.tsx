// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { patchFeatureFlagUrl } from '../../../api/requests/patchFeatureFlag';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { FeatureFlagDescription } from '../FeatureFlagDescription';

describe('FeatureFlagDescription', () => {
  it('should handle the editing of a description', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({}));
    const data = {
      featureFlagId: 'flag-id-123',
    };

    render(<FeatureFlagDescription featureFlagId={data.featureFlagId} description="description" readOnly={false} />);

    await userEvent.click(screen.getByLabelText('Edit description'));

    expect(await screen.findByText('Save')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Flag description'), ' 1');
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${patchFeatureFlagUrl(data.featureFlagId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: 'description 1',
          archived: false,
        }),
        headers: {
          'Content-Type': 'application/json',
          cookie: '',
        },
      });
    });
  });

  it('should handle an error when saving a description', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => {
      throw new Error('Failed to save changes');
    });

    render(<FeatureFlagDescription featureFlagId="flag-id-456" description="description" readOnly={false} />);
    const _data = {
      applicationName: 'application-name',
      featureFlagType: FeatureFlagType.String,
      featureFlagKey: 'feature-flag-key',
    };

    await userEvent.click(screen.getByLabelText('Edit description'));

    expect(await screen.findByText('Save')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Flag description'), ' 1');
    await userEvent.click(screen.getByText('Save'));

    expect(await screen.findByText('System error')).toBeInTheDocument();
    expect(await screen.findByText('Something went wrong on our end. Try again in a moment.')).toBeInTheDocument();
    expect(screen.queryByText('Failed to save changes')).not.toBeInTheDocument();
  });
});

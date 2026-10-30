// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnvironmentKey } from 'shared-types';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { FeatureFlagEnvironmentActions } from '../FeatureFlagEnvironmentActions';
import TestProviders from '../../../test/TestProviders';

const baseEnvironment = {
  createdAt: '',
  defaultServeId: 'default-serve-id',
  enabled: true,
  environmentId: 'env-id',
  flagId: 'flag-id',
  updatedAt: '',
  defaultServeKey: 'default-serve-key',
  environmentKey: EnvironmentKey.Development,
  flag: {
    applicationId: 'application-id',
    key: 'featureFlagKey',
  },
};

describe('FeatureFlagEnvironmentActions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should allow the user to toggle the enabled state of a flag', async () => {
    const featureFlagDisabled = {
      enabled: false,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(featureFlagDisabled));
    render(
      <TestProviders>
        <FeatureFlagEnvironmentActions
          environments={[
            baseEnvironment,
            {
              ...baseEnvironment,
              environmentId: 'env-id-2',
              environmentKey: EnvironmentKey.Production,
            },
          ]}
        />
      </TestProviders>,
    );

    expect(await screen.findAllByText('On')).toHaveLength(2);

    await userEvent.click(screen.getByText('Production'));

    expect(await screen.findByText('Off')).toBeInTheDocument();
  });

  it('should handle error when toggling the state of a flag', async () => {
    const featureFlagDisabled = {
      enabled: false,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(featureFlagDisabled, false));
    render(
      <TestProviders>
        <FeatureFlagEnvironmentActions
          environments={[
            baseEnvironment,
            {
              ...baseEnvironment,
              environmentId: 'env-id-2',
              environmentKey: EnvironmentKey.Production,
            },
          ]}
        />
      </TestProviders>,
    );

    expect(await screen.findAllByText('On')).toHaveLength(2);

    await userEvent.click(screen.getByText('Production'));

    expect(await screen.findByText('Error saving changes')).toBeInTheDocument();
  });
});

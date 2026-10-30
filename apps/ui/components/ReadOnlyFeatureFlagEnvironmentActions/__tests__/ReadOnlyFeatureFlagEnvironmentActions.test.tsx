// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnvironmentKey } from 'shared-types';

import { ReadOnlyFeatureFlagEnvironmentActions } from '../ReadOnlyFeatureFlagEnvironmentActions';
import TestProviders from '../../../test/TestProviders';

describe('ReadOnlyFeatureFlagEnvironmentActions', () => {
  const baseEnvironment = {
    createdAt: '',
    defaultServeId: 'serve-id',
    defaultServeKey: 'serve-key',
    environmentId: '',
    environmentKey: '',
    flagId: 'flag-id',
    flag: {
      applicationId: 'app-id',
      key: 'flag-key',
    },
    updatedAt: '',
  };

  it('should render as enabled', async () => {
    render(
      <TestProviders>
        <ReadOnlyFeatureFlagEnvironmentActions
          environments={[
            { ...baseEnvironment, environmentId: 'env-1', environmentKey: EnvironmentKey.Development, enabled: true },
            { ...baseEnvironment, environmentId: 'env-2', environmentKey: EnvironmentKey.Production, enabled: true },
          ]}
        />
      </TestProviders>,
    );

    expect(screen.getAllByText('On')).toHaveLength(2);
  });

  it('should render as disabled', async () => {
    render(
      <TestProviders>
        <ReadOnlyFeatureFlagEnvironmentActions
          environments={[
            { ...baseEnvironment, environmentId: 'env-1', environmentKey: EnvironmentKey.Development, enabled: false },
            { ...baseEnvironment, environmentId: 'env-2', environmentKey: EnvironmentKey.Production, enabled: false },
          ]}
        />
      </TestProviders>,
    );

    expect(screen.getAllByText('Off')).toHaveLength(2);
  });

  it('should render a restore tooltip when archived', async () => {
    render(
      <TestProviders>
        <ReadOnlyFeatureFlagEnvironmentActions
          archived
          environments={[
            { ...baseEnvironment, environmentId: 'env-1', environmentKey: EnvironmentKey.Development, enabled: false },
          ]}
        />
      </TestProviders>,
    );

    expect(screen.getByText('Restore this flag before toggling environments')).toBeInTheDocument();
  });
});

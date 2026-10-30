// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { ReadOnlyFeatureFlagVariations } from '../ReadOnlyFeatureFlagVariations';

describe('ReadOnlyFeatureFlagVariations', () => {
  const variation = {
    applicationName: 'applicationName',
    createdAt: '',
    deletedAt: null,
    flagId: 'flag-id',
    flagKey: 'featureFlagKey',
    id: 'variation-id',
    key: 'first',
    updatedAt: '',
    value: 'first value',
  };

  it('should render non object variations', async () => {
    render(
      <TestProviders>
        <ReadOnlyFeatureFlagVariations variations={[variation]} featureFlagType={FeatureFlagType.String} />
      </TestProviders>,
    );

    expect(await screen.findByText(variation.value)).toBeInTheDocument();
    expect(screen.getByText(variation.key)).toBeInTheDocument();
  });

  it('should render object variations', async () => {
    const variation = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'first',
      updatedAt: '',
      value: `{ "foo": false }`,
    };

    render(
      <TestProviders>
        <ReadOnlyFeatureFlagVariations variations={[variation]} featureFlagType={FeatureFlagType.Object} />
      </TestProviders>,
    );

    expect(screen.getByText('"{ \\"foo\\": false }"')).toBeInTheDocument();
    expect(screen.getByText('first')).toBeInTheDocument();
  });
});

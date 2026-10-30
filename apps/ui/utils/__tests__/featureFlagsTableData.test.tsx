// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { ActionType, FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { actionLabels, featureFlagTypeLabels } from '../../constants/common';
import featureFlagsTableData from '../featureFlagsTableData';

describe('featureFlagsTableData', () => {
  const flag = {
    applicationId: 'application-id',
    applicationName: 'application-name',
    archived: false,
    createdAt: '2025-04-11 16:00:00.00+00',
    enabled: {
      production: true,
      development: false,
    },
    key: 'feature-flag-key',
    updatedAt: '2025-04-11 17:00:00.00+00',
    rules: [],
    type: FeatureFlagType.Boolean,
  };

  it('returns formatted table values and renders the flag links and type', () => {
    const result = featureFlagsTableData([flag])[0];

    expect(result?.id).toEqual('application-name/feature-flag-key');
    expect(result?.createdAt).toEqual('04/11/2025 at 12:00 PM');
    expect(result?.updatedAt).toEqual('04/11/2025 at 01:00 PM');
    const { rerender } = render(
      <>
        {result?.applicationName}
        {result?.key}
        {result?.type}
      </>,
    );

    expect(screen.getByRole('link', { name: flag.applicationName })).toHaveAttribute(
      'href',
      `/applications/${flag.applicationName}`,
    );

    expect(screen.getByRole('link', { name: flag.key })).toHaveAttribute(
      'href',
      `/applications/${flag.applicationName}/flags/${flag.key}`,
    );
    expect(screen.getByText(featureFlagTypeLabels[FeatureFlagType.Boolean])).toBeInTheDocument();
    expect(screen.queryByText(actionLabels[ActionType.Archive])).not.toBeInTheDocument();

    const archivedResult = featureFlagsTableData([{ ...flag, archived: true }])[0];
    rerender(archivedResult?.key);

    expect(screen.getByText(actionLabels[ActionType.Archive])).toBeInTheDocument();
  });
});

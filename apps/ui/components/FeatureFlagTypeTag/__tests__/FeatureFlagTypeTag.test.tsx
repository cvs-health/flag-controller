// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { FeatureFlagTypeTag } from '../FeatureFlagTypeTag';

describe('FeatureFlagTypeTag', () => {
  it('renders the correct label', () => {
    render(<FeatureFlagTypeTag type={FeatureFlagType.Boolean} />);

    expect(screen.getByText('Boolean')).toBeInTheDocument();
  });
});

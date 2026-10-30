// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlagsTargetedEnvironmentCount } from '../FlagsTargetedEnvironmentCount';

describe('FlagsTargetedEnvironmentCount', () => {
  it('renders count and environment', () => {
    const count = 2;
    const environment = 'production';
    render(<FlagsTargetedEnvironmentCount count={count} environment={environment} />);

    expect(screen.getByText(count)).toBeInTheDocument();
    expect(screen.getByText(environment)).toBeInTheDocument();
  });
});

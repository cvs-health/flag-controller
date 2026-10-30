// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EnvironmentStatus } from '../EnvironmentStatus';

describe('EnvironmentStatus', () => {
  it('renders CircleSolid when enabled is true', () => {
    render(<EnvironmentStatus enabled environment="production" />);

    const circle = screen.getByTitle('checkmark-filled');

    expect(circle).toBeInTheDocument();
  });

  it('renders a CircleStroke when enabled is false', () => {
    render(<EnvironmentStatus enabled={false} environment="production" />);

    const circle = screen.getByTitle('circle-stroke');

    expect(circle).toBeInTheDocument();
  });
});

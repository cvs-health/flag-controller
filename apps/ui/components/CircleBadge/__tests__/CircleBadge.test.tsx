// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CircleBadge from '../CircleBadge';

describe('CircleBadge', () => {
  it('should render the provided label', () => {
    const label = '1';

    render(<CircleBadge label={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReadOnlyVariationServe } from '../ReadOnlyVariationServe';

describe('ReadOnlyVariationServe', () => {
  it('should render SERVE label with variation key', () => {
    const variations = [
      {
        id: 'var-1',
        key: 'control',
        value: 'control_value',
        createdAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
        flagId: 'flag-1',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'var-2',
        key: 'treatment',
        value: 'treatment_value',
        createdAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
        flagId: 'flag-1',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    render(<ReadOnlyVariationServe variationId="var-1" variations={variations} />);

    expect(screen.getByText(/SERVE/)).toBeInTheDocument();
    expect(screen.getByText(/control/)).toBeInTheDocument();
  });
});

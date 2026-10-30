// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReadOnlyDefaultRule } from '../ReadOnlyDefaultRule';

describe('ReadOnlyDefaultRule', () => {
  it('should render the default variation', () => {
    const variation = {
      createdAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      flagId: 'flag-1',
      id: 'variation-id',
      key: 'variation-key',
      updatedAt: '2024-01-01T00:00:00Z',
      value: 'variation-value',
    };
    render(<ReadOnlyDefaultRule defaultVariationId={variation.id} variations={[variation]} />);

    expect(screen.getByText(variation.key)).toBeInTheDocument();
  });
});

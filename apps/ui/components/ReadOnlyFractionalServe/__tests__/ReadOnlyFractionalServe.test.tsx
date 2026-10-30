// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReadOnlyFractionalServe } from '../ReadOnlyFractionalServe';

describe('ReadOnlyFractionalServe', () => {
  it('should render a weighted-rollout', () => {
    render(
      <ReadOnlyFractionalServe
        fractional={{
          var: 'user',
          weights: [
            ['variation-1', 50],
            ['variation-2', 50],
          ],
        }}
        variations={[
          {
            id: 'variation-1',
            key: 'variation-1',
            value: true,
            createdAt: '',
            deletedAt: null,
            flagId: 'flag-id',
            updatedAt: '',
          },
          {
            id: 'variation-2',
            key: 'variation-2',
            value: false,
            createdAt: '',
            deletedAt: null,
            flagId: 'flag-id',
            updatedAt: '',
          },
        ]}
      />,
    );

    expect(screen.getByText('WEIGHTED ROLLOUT')).toBeInTheDocument();
  });
});

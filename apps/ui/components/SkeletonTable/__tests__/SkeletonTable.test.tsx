// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SkeletonTable } from '../SkeletonTable';

describe('SkeletonTable', () => {
  it('renders the correct number of rows and columns', () => {
    render(
      <table>
        <tbody>
          <SkeletonTable rowCount={3} columnCount={4} />
        </tbody>
      </table>,
    );

    const rows = screen.getAllByRole('row');
    const cells = screen.getAllByRole('cell');

    expect(rows).toHaveLength(3);
    expect(cells).toHaveLength(12);
  });

  it('renders default 5 rows and 5 columns when no props are provided', () => {
    render(
      <table>
        <tbody>
          <SkeletonTable />
        </tbody>
      </table>,
    );

    const rows = screen.getAllByRole('row');
    const cells = screen.getAllByRole('cell');

    expect(rows).toHaveLength(5);
    expect(cells).toHaveLength(25);
  });
});

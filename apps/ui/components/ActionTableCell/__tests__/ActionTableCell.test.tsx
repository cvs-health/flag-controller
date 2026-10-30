// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Add } from '@carbon/icons-react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ActionTableCell } from '../ActionTableCell';
import userEvent from '@testing-library/user-event';

describe('ActionTableCell', () => {
  it('should show items', async () => {
    const item1 = {
      id: 'item-1',
      label: 'Item 1',
      onClick: () => null,
    };
    const item2 = {
      id: 'item-2',
      label: 'Item 2',
      icon: Add,
      onClick: () => null,
    };

    render(
      <table>
        <tbody>
          <tr>
            <ActionTableCell rowId="1" items={[item1, item2]} />
          </tr>
        </tbody>
      </table>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText(item1.label)).toBeInTheDocument();
    expect(screen.getByLabelText(item2.label)).toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RuleSorter } from '../RuleSorter';

describe('RuleSorter', () => {
  it('should handle sorting', async () => {
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();
    const { getByLabelText } = render(<RuleSorter onMoveUp={onMoveUp} onMoveDown={onMoveDown} />);

    await userEvent.click(getByLabelText('Move up'));
    await userEvent.click(getByLabelText('Move down'));

    expect(onMoveUp).toHaveBeenCalledTimes(1);
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });
});

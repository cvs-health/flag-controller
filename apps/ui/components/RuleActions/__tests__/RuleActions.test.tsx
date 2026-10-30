// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RuleActions } from '../RuleActions';

describe('RuleActions', () => {
  it('should handle moving a rule', async () => {
    const onMoveDown = vi.fn();
    const onMoveUp = vi.fn();
    const { getByLabelText } = render(
      <RuleActions onMoveDown={onMoveDown} onMoveUp={onMoveUp} removeEnabled removed={false} />,
    );

    await userEvent.click(getByLabelText('Move up'));
    await userEvent.click(getByLabelText('Move down'));

    expect(onMoveDown).toBeCalledTimes(1);
    expect(onMoveUp).toBeCalledTimes(1);
  });

  it('should handle removing a rule', async () => {
    const onMoveDown = vi.fn();
    const onMoveUp = vi.fn();
    const onRemove = vi.fn();
    const onRestore = vi.fn();
    const { getByText } = render(
      <RuleActions
        onMoveDown={onMoveDown}
        onMoveUp={onMoveUp}
        onRemove={onRemove}
        onRestore={onRestore}
        removeEnabled
        removed={false}
      />,
    );

    await userEvent.click(getByText('Remove'));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should handle restoring a rule', async () => {
    const onMoveDown = vi.fn();
    const onMoveUp = vi.fn();
    const onRemove = vi.fn();
    const onRestore = vi.fn();
    const { getByText } = render(
      <RuleActions
        onMoveDown={onMoveDown}
        onMoveUp={onMoveUp}
        onRemove={onRemove}
        onRestore={onRestore}
        removeEnabled
        removed
      />,
    );

    await userEvent.click(getByText('Undo rule removal'));

    expect(onRestore).toHaveBeenCalledTimes(1);
  });
});

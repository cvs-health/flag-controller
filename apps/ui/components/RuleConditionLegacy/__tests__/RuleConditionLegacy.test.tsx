// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Operator } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { RuleConditional } from '../../../typings/rules';
import { RuleConditionLegacy } from '../RuleConditionLegacy';

describe('RuleConditionLegacy', () => {
  it('should render condition with inputs', () => {
    const onRemove = vi.fn();
    render(
      <RuleConditionLegacy
        attribute="country"
        conditional={RuleConditional.If}
        context="user"
        onRemove={onRemove}
        operator={Operator.In}
        position={0}
        values="US, CA"
      />,
    );

    expect(screen.getByDisplayValue('user')).toBeInTheDocument();
    expect(screen.getByDisplayValue('country')).toBeInTheDocument();
    expect(screen.getByDisplayValue('US, CA')).toBeInTheDocument();
    expect(screen.getByLabelText('Operator')).toHaveValue(Operator.In);
  });

  it('should handle removing a condition', async () => {
    const onRemove = vi.fn();
    render(
      <RuleConditionLegacy
        attribute="country"
        conditional={RuleConditional.If}
        context="user"
        onRemove={onRemove}
        operator={Operator.In}
        position={1}
        values="test"
      />,
    );

    await userEvent.click(screen.getByTitle('Remove condition'));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('should not show remove button on first condition', () => {
    const onRemove = vi.fn();
    render(
      <RuleConditionLegacy
        attribute="country"
        conditional={RuleConditional.If}
        context="user"
        onRemove={onRemove}
        operator={Operator.In}
        position={0}
        values="test"
      />,
    );

    expect(screen.queryByTitle('Remove condition')).toBeNull();
  });
});

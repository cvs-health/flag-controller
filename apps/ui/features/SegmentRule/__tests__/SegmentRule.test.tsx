// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { Clause, Operator, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SegmentRule } from '../SegmentRule';

describe('SegmentRule', () => {
  it('handles adding a new AND condition', async () => {
    render(
      <SegmentRule
        assignedKey="rule-key"
        defaultConditions={[
          {
            context: 'user',
            values: '',
            operator: Operator.In,
            clause: Clause.If,
            type: RuleConditionType.Context,
            valuesType: RuleConditionValueType.String,
          },
        ]}
        id="rule-1"
      />,
    );

    expect(screen.queryByText('AND')).toBe(null);

    await userEvent.click(screen.getByText('Add AND condition'));

    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('handles removing a condition', async () => {
    render(
      <SegmentRule
        assignedKey="rule-key"
        defaultConditions={[
          {
            context: 'user',
            values: '',
            operator: Operator.In,
            clause: Clause.If,
            type: RuleConditionType.Context,
            valuesType: RuleConditionValueType.String,
          },
          {
            context: 'application',
            values: '',
            operator: Operator.In,
            clause: Clause.And,
            type: RuleConditionType.Context,
            valuesType: RuleConditionValueType.String,
          },
        ]}
        id="rule-1"
      />,
    );

    expect(screen.getByDisplayValue('application')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Remove condition'));

    expect(screen.queryByDisplayValue('application')).toBeNull();
  });
});

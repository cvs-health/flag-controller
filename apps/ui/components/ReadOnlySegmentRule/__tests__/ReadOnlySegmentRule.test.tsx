// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { Clause, Operator, RuleConditionType, RuleConditionValueType, type ContextRuleCondition } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { ReadOnlySegmentRule } from '../ReadOnlySegmentRule';

const conditions: ContextRuleCondition[] = [
  {
    attribute: 'country',
    clause: Clause.If,
    context: 'user',
    operator: Operator.In,
    type: RuleConditionType.Context,
    values: 'US',
    valuesType: RuleConditionValueType.String,
  },
  {
    attribute: 'plan',
    clause: Clause.And,
    context: 'user',
    operator: Operator.LooseEquals,
    type: RuleConditionType.Context,
    values: 'pro',
    valuesType: RuleConditionValueType.String,
  },
];

describe('ReadOnlySegmentRule', () => {
  it('renders the rule', () => {
    render(<ReadOnlySegmentRule assignedKey="premium-users" defaultConditions={conditions} id="rule-1" />);

    expect(screen.getByText('Rule key')).toBeInTheDocument();
    expect(screen.getByText('premium-users')).toBeInTheDocument();
    expect(screen.getByText('context user.country contains US')).toBeInTheDocument();
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('context user.plan equals pro')).toBeInTheDocument();
  });

  it('renders a rule without conditions', () => {
    render(<ReadOnlySegmentRule assignedKey="empty-rule" defaultConditions={[]} id="rule-2" />);

    expect(screen.getByText('empty-rule')).toBeInTheDocument();
    expect(screen.queryByText(/context/)).not.toBeInTheDocument();
  });
});

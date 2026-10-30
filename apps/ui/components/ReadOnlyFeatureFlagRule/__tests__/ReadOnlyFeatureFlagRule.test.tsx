// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { Clause, Operator, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { ReadOnlyFeatureFlagRule } from '../ReadOnlyFeatureFlagRule';

describe('ReadOnlyFeatureFlagRule', () => {
  it('renders conditions and rollout', async () => {
    const variations = [
      {
        applicationName: 'application',
        createdAt: '',
        deletedAt: null,
        environmentName: 'environment',
        flagId: 'flag-id',
        flagKey: 'flag-key',
        id: 'variation-id',
        key: 'variation-1',
        updatedAt: '',
        value: 'value',
      },
    ];

    render(
      <ReadOnlyFeatureFlagRule
        assignedKey="rule-key"
        conditions={[
          {
            id: 'condition-1',
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            values: 'US',
            valuesType: RuleConditionValueType.String,
            type: RuleConditionType.Context,
          },
          {
            id: 'condition-2',
            clause: Clause.And,
            context: 'user',
            operator: Operator.In,
            values: 'country',
            valuesType: RuleConditionValueType.String,
            type: RuleConditionType.Context,
          },
        ]}
        id="rule-id"
        orderPosition={1}
        segments={[]}
        serveFractional={null}
        serveVariationId="variation-id"
        variations={variations}
      />,
    );

    expect(screen.getByText('variation-1')).toBeInTheDocument();
    expect(screen.getByText('IF')).toBeInTheDocument();
    expect(screen.getByText('rule-key')).toBeInTheDocument();
  });
});

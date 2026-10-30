// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import {
  FeatureFlagType,
  RuleConditionType,
  RuleConditionValueType,
  Clause,
  Operator,
  type ContextRuleCondition,
} from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlagRulesSidebar } from '../FeatureFlagRulesSidebar';

describe('FeatureFlagRulesSidebar', () => {
  it('should handle actions', async () => {
    const onAddRule = vi.fn();
    const onReorderRules = vi.fn();
    const baseMockRule = {
      conditions: [
        {
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: 'US',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
      createdAt: '',
      deletedAt: null,
      environmentId: 'environment-id',
      flagId: 'flag-id',
      id: '',
      key: '',
      updatedAt: '',
      orderPosition: 0,
      segmentId: null,
      serveFractionalId: null,
      serveVariationId: null,
      serveFractional: null,
    };
    const mockRules = [
      { ...baseMockRule, id: 'rule-1', key: 'rule-1' },
      { ...baseMockRule, id: 'rule-2', key: 'rule-2' },
    ];
    const variations = [
      {
        id: 'variation-1',
        key: 'variation-1',
        value: true,
        createdAt: '',
        deletedAt: null,
        flagId: 'flag-id',
        flagKey: '',
        updatedAt: '',
      },
    ];

    render(
      <TestProviders>
        <FeatureFlagRulesSidebar
          onAddRule={onAddRule}
          rules={mockRules}
          applicationId="application-id"
          defaultVariationKey="default-variation-key"
          environmentId="environment-id"
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          onReorderRules={onReorderRules}
          variations={variations}
        />
      </TestProviders>,
    );

    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('rule-1')).toBeInTheDocument();
    expect(screen.getByText('rule-2')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }));

    expect(onAddRule).toHaveBeenCalledOnce();
  });
});

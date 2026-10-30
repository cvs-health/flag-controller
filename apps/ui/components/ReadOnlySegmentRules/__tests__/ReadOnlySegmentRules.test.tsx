// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import {
  Clause,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type ContextRuleCondition,
  type RulesJoined,
} from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { ReadOnlySegmentRules } from '../ReadOnlySegmentRules';

vi.mock('../../../features/EnvironmentSwitcher/EnvironmentSwitcher', () => ({
  EnvironmentSwitcher: ({ environmentId }: { environmentId: string }) => <div>Environment: {environmentId}</div>,
}));

const condition: ContextRuleCondition = {
  attribute: 'country',
  clause: Clause.If,
  context: 'user',
  operator: Operator.In,
  type: RuleConditionType.Context,
  values: 'US',
  valuesType: RuleConditionValueType.String,
};

function rule(id: string, key: string): RulesJoined {
  return {
    createdAt: '2023-10-01T00:00:00Z',
    deletedAt: null,
    environmentId: 'environment-1',
    flagId: null,
    key,
    conditions: [condition],
    id,
    orderPosition: 0,
    segmentId: 'segment-1',
    serveVariationId: null,
    serveVariationKey: null,
    serveFractionalId: null,
    serveFractional: null,
    updatedAt: '2023-10-01T00:00:00Z',
  };
}

describe('ReadOnlySegmentRules', () => {
  it('renders the environment and each existing rule', () => {
    render(
      <ReadOnlySegmentRules
        environmentId="environment-1"
        existingRules={[rule('rule-1', 'premium-users'), rule('rule-2', 'beta-users')]}
      />,
    );

    expect(screen.getByText('Environment: environment-1')).toBeInTheDocument();
    expect(screen.getByText('premium-users')).toBeInTheDocument();
    expect(screen.getByText('beta-users')).toBeInTheDocument();
    expect(screen.getAllByText('context user.country contains US')).toHaveLength(2);
  });

  it('renders no rules when the collection is empty', () => {
    render(<ReadOnlySegmentRules environmentId="environment-1" existingRules={[]} />);

    expect(screen.getByText('Environment: environment-1')).toBeInTheDocument();
    expect(screen.queryByText('Rule key')).not.toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { Clause, Operator, RuleConditionType, RuleConditionValueType } from 'shared-types';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import RulesList from '../RulesList';
import TestProviders from '../../../test/TestProviders';

describe('RulesList', () => {
  it('should handle removing a rule', async () => {
    const rule = {
      environmentId: 'environment-id',
      flagId: 'flag-id',
      key: 'rule-key',
      conditions: [
        {
          clause: Clause.If,
          operator: Operator.In,
          values: 'us',
          context: 'user',
          attribute: 'country',
          type: RuleConditionType.Context as const,
          valuesType: RuleConditionValueType.String as const,
        },
      ],
      id: '1',
      orderPosition: 0,
      serveVariationId: 'variation-1',
      serveFractionalId: null,
      serveFractional: null,
    };

    const variation = {
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      id: 'variation-1',
      key: 'yes',
      updatedAt: '',
      value: true,
    };

    render(
      <TestProviders>
        <RulesList defaultVariationId={variation.id} rules={[rule]} segments={[]} variations={[variation]} />
      </TestProviders>,
    );

    expect(screen.queryByText('Cancel removal')).toBeNull();

    await userEvent.click(screen.getByLabelText('Remove rule'));

    expect(screen.getByText('Cancel removal')).toBeInTheDocument();
  });
});

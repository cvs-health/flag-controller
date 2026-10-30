// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Clause, Operator, RuleConditionValueType, RuleConditionType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import { FeatureFlagRule } from '../FeatureFlagRule';
import TestProviders from '../../../test/TestProviders';

describe('FeatureFlagRule', () => {
  it('handles adding a new condition', async () => {
    const onRemoveRule = vi.fn();

    render(
      <TestProviders>
        <FeatureFlagRule
          assignedKey="rule-key"
          defaultConditions={[
            {
              id: 'condition-1',
              attribute: 'country',
              clause: Clause.If,
              context: 'user',
              operator: Operator.In,
              type: RuleConditionType.Context,
              values: 'US',
              valuesType: RuleConditionValueType.String,
            },
          ]}
          id="rule-1"
          onRemoveRule={onRemoveRule}
          orderPosition={0}
          variations={[]}
          segments={[]}
          serveVariationId="variation-1"
          serveFractional={null}
        />
      </TestProviders>,
    );

    expect(screen.queryAllByText('IF')).toHaveLength(2);

    // Expand the rule to see edit controls
    await userEvent.click(screen.getByLabelText('Edit rule'));

    await userEvent.click(screen.getByText('Add condition'));
    await userEvent.click(screen.getByText('Context condition'));

    expect(await screen.findAllByText('AND')).toHaveLength(1);
  });

  it('handles removing a condition', async () => {
    const onRemoveRule = vi.fn();

    render(
      <TestProviders>
        <FeatureFlagRule
          assignedKey="rule-key"
          defaultConditions={[
            {
              id: 'condition-1',
              context: 'user',
              values: '',
              operator: Operator.In,
              clause: Clause.If,
              type: RuleConditionType.Context,
              valuesType: RuleConditionValueType.String,
            },
            {
              id: 'condition-2',
              context: 'application',
              values: '',
              operator: Operator.In,
              clause: Clause.And,
              type: RuleConditionType.Context,
              valuesType: RuleConditionValueType.String,
            },
          ]}
          id="rule-1"
          onRemoveRule={onRemoveRule}
          orderPosition={0}
          variations={[]}
          segments={[]}
          serveVariationId="variation-1"
          serveFractional={null}
        />
      </TestProviders>,
    );

    expect(screen.getByDisplayValue('application')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Edit rule'));
    const removeConditionButtons = await screen.findAllByText('Remove condition');
    await userEvent.click(removeConditionButtons[1] as HTMLElement);

    expect(screen.queryByDisplayValue('application')).toBeNull();
  });

  it('should reset conditions when cancel edit is clicked', async () => {
    const onRemoveRule = vi.fn();

    render(
      <TestProviders>
        <FeatureFlagRule
          assignedKey="rule-key"
          defaultConditions={[
            {
              id: 'condition-1',
              attribute: 'country',
              clause: Clause.If,
              context: 'user',
              operator: Operator.In,
              type: RuleConditionType.Context,
              values: 'US',
              valuesType: RuleConditionValueType.String,
            },
          ]}
          id="rule-1"
          onRemoveRule={onRemoveRule}
          orderPosition={0}
          serveVariationId="variation-1"
          serveFractional={null}
          variations={[]}
          segments={[]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByLabelText('Edit rule'));

    expect(screen.queryAllByText('AND')).toHaveLength(0);

    await userEvent.click(screen.getByText('Add condition'));
    await userEvent.click(screen.getByText('Context condition'));

    expect(await screen.findAllByText('AND')).toHaveLength(1);

    await userEvent.click(screen.getByText('Cancel edit'));

    await waitFor(() => {
      expect(screen.queryAllByText('AND').length).toBe(0);
    });
  });

  it('should show error banner when rule has validation errors', async () => {
    const onRemoveRule = vi.fn();

    render(
      <TestProviders>
        <form>
          <FeatureFlagRule
            assignedKey="rule-key"
            defaultConditions={[]}
            id="rule-1"
            newRule
            onRemoveRule={onRemoveRule}
            orderPosition={0}
            serveVariationId="variation-1"
            serveFractional={null}
            variations={[]}
            segments={[]}
          />
          <input name="key" defaultValue="rule-key-1" />
        </form>
      </TestProviders>,
    );

    expect(screen.queryByText('Rule incomplete.')).not.toBeInTheDocument();

    const input = screen.getByDisplayValue('rule-key');
    fireEvent.change(input, { target: { value: 'rule-key-1' } });
    fireEvent.invalid(input);

    expect(screen.getByText('Rule incomplete.')).toBeInTheDocument();
    expect(screen.getByText('Please edit and complete the rule.')).toBeInTheDocument();
  });
});

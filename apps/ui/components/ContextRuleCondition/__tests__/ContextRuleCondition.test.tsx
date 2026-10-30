// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Operator } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlag } from '../../../typings/common';
import { ContextRuleCondition } from '../ContextRuleCondition';
import { RuleConditional } from '../../../typings/rules';

describe('ContextRuleCondition', () => {
  it('shows a textarea for list operators', async () => {
    render(
      <TestProviders featureFlags={{ [FeatureFlag.RuleValueTypes]: false }}>
        <ContextRuleCondition
          id="condition-2"
          attribute="country"
          conditional={RuleConditional.If}
          context="user"
          onRemove={vi.fn()}
          operator={Operator.In}
          position={1}
          ruleId="rule-1"
          values="test"
        />
      </TestProviders>,
    );

    const operatorSelect = screen.getByLabelText('Operator');
    expect(screen.getByLabelText('Value').tagName).toBe('INPUT');

    await userEvent.selectOptions(operatorSelect, Operator.InList);
    expect(screen.getByLabelText('Value').tagName).toBe('TEXTAREA');

    await userEvent.selectOptions(operatorSelect, Operator.NotInList);
    expect(screen.getByLabelText('Value').tagName).toBe('TEXTAREA');

    await userEvent.selectOptions(operatorSelect, Operator.In);
    expect(screen.getByLabelText('Value').tagName).toBe('INPUT');
  });

  it('keeps unsaved values when switching between input types', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders featureFlags={{ [FeatureFlag.RuleValueTypes]: false }}>
        <ContextRuleCondition
          id="condition-2"
          attribute="country"
          conditional={RuleConditional.If}
          context="user"
          onRemove={vi.fn()}
          operator={Operator.In}
          position={1}
          ruleId="rule-1"
          values=""
        />
      </TestProviders>,
    );

    const operatorSelect = screen.getByLabelText('Operator');
    await user.type(screen.getByLabelText('Value'), 'US');
    await user.selectOptions(operatorSelect, Operator.InList);
    expect(screen.getByLabelText('Value')).toHaveValue('US');

    await user.clear(screen.getByLabelText('Value'));
    await user.type(screen.getByLabelText('Value'), 'CA');
    await user.selectOptions(operatorSelect, Operator.In);
    expect(screen.getByLabelText('Value')).toHaveValue('CA');
  });

  it('should handle removing a condition', async () => {
    const onRemove = vi.fn();

    render(
      <TestProviders featureFlags={{ [FeatureFlag.RuleValueTypes]: false }}>
        <ContextRuleCondition
          id="condition-2"
          attribute="country"
          conditional={RuleConditional.If}
          context="user"
          onRemove={onRemove}
          operator={Operator.In}
          position={1}
          ruleId="rule-1"
          values="test"
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Remove condition'));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith('condition-2');
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { Operator } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { RuleConditional } from '../../../typings/rules';
import { ReadOnlyContextRuleCondition } from '../ReadOnlyContextRuleCondition';

describe('ReadOnlyContextRuleCondition', () => {
  it('should render the condition', async () => {
    render(
      <ReadOnlyContextRuleCondition
        attribute="country"
        conditional={RuleConditional.If}
        context="user"
        operator={Operator.In}
        values="test"
      />,
    );

    expect(screen.getByText('context user.country contains test')).toBeInTheDocument();
  });
});

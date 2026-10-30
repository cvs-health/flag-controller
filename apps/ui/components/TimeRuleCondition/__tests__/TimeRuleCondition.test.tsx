// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { Operator, TimeZone } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RuleConditional } from '../../../typings/rules';
import { TimeRuleCondition } from '../TimeRuleCondition';

describe('TimeRuleCondition', () => {
  it('should populate form with default values', async () => {
    const onRemove = vi.fn();

    render(
      <TimeRuleCondition
        conditional={RuleConditional.If}
        endDate={null}
        id="condition-1"
        onRemove={onRemove}
        operator={Operator.LessThan}
        startDate="2026-01-01T10:00:00.000Z"
        startDateTimeZone={TimeZone.NewYork}
        ruleId="rule-id"
      />,
    );

    expect(screen.getByLabelText('Operator')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Start time')).toBeInTheDocument();
  });

  it('should handle removing a condition', async () => {
    const onRemove = vi.fn();

    render(
      <TimeRuleCondition
        conditional={RuleConditional.If}
        endDate={null}
        id="condition-2"
        onRemove={onRemove}
        operator={Operator.LessThan}
        startDate="2026-01-01T10:00:00.000Z"
        startDateTimeZone={TimeZone.NewYork}
        ruleId="rule-id"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove condition' }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith('condition-2');
  });

  it('should show end date and end time when operator is between', async () => {
    render(
      <TimeRuleCondition
        conditional={RuleConditional.If}
        endDate="2026-01-01T18:00:00.000Z"
        endDateTimeZone={TimeZone.NewYork}
        id="condition-3"
        onRemove={vi.fn()}
        operator={Operator.LessThanOrEqual}
        startDate="2026-01-01T10:00:00.000Z"
        startDateTimeZone={TimeZone.NewYork}
        ruleId="rule-id"
      />,
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByText('End time')).toBeInTheDocument();
  });
});

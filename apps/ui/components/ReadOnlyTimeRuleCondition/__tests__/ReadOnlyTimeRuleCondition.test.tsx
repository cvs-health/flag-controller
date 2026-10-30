// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { Operator, TimeZone } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { RuleConditional } from '../../../typings/rules';
import { ReadOnlyTimeRuleCondition } from '../ReadOnlyTimeRuleCondition';

describe('ReadOnlyTimeRuleCondition', () => {
  it('should render time condition with start date only', () => {
    render(
      <ReadOnlyTimeRuleCondition
        conditional={RuleConditional.If}
        operator={Operator.GreaterThan}
        startDate="2024-01-15T10:30:00Z"
        startDateTimeZone={TimeZone.NewYork}
      />,
    );

    expect(screen.getByText('IF')).toBeInTheDocument();
    expect(screen.getByText(/is after/)).toBeInTheDocument();
    expect(screen.getByText(/01\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/EST/)).toBeInTheDocument();
  });

  it('should render time condition with date range', () => {
    render(
      <ReadOnlyTimeRuleCondition
        conditional={RuleConditional.And}
        operator={Operator.LessThanOrEqual}
        startDate="2024-01-15T10:30:00Z"
        startDateTimeZone={TimeZone.Chicago}
        endDate="2024-02-15T18:45:00Z"
        endDateTimeZone={TimeZone.Chicago}
      />,
    );

    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText(/is between/)).toBeInTheDocument();
    expect(screen.getByText(/01\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/02\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/CST/)).toBeInTheDocument();
  });

  it('should render with LessThan operator', () => {
    render(
      <ReadOnlyTimeRuleCondition
        conditional={RuleConditional.If}
        operator={Operator.LessThan}
        startDate="2024-12-31T23:59:00Z"
        startDateTimeZone={TimeZone.LosAngeles}
      />,
    );

    expect(screen.getByText(/is before/)).toBeInTheDocument();
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/PST/)).toBeInTheDocument();
  });
});

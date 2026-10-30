// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { Clause, Operator, RuleConditionType, RuleConditionValueType, TimeZone } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { RuleSummary } from '../RuleSummary';
import type { RuleConditionWithId } from '../../../typings/rules';

describe('RuleSummary', () => {
  const variations = [
    {
      id: 'variation-1',
      key: 'control',
      value: 'control-value',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      updatedAt: '',
    },
    {
      id: 'variation-2',
      key: 'treatment',
      value: 'treatment-value',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      updatedAt: '',
    },
  ];
  const segments = new Map([['segment-1', 'beta-users']]);

  it('renders a context condition', () => {
    const conditions: RuleConditionWithId[] = [
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
    ];

    render(
      <RuleSummary
        conditions={conditions}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={null}
      />,
    );

    expect(screen.getByText('context user.country contains US')).toBeInTheDocument();
  });

  it('renders a segment condition using the segment key', () => {
    const conditions: RuleConditionWithId[] = [
      {
        id: 'condition-1',
        clause: Clause.If,
        operator: Operator.In,
        segmentId: 'segment-1',
        type: RuleConditionType.Segment,
      },
    ];

    render(
      <RuleSummary
        conditions={conditions}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={null}
      />,
    );

    expect(screen.getByText('beta-users')).toBeInTheDocument();
  });

  it('renders a time condition', () => {
    const conditions: RuleConditionWithId[] = [
      {
        id: 'condition-1',
        clause: Clause.If,
        endDate: null,
        endDateTimeZone: null,
        operator: Operator.GreaterThan,
        startDate: '2024-01-15T10:30:00Z',
        startDateTimeZone: TimeZone.NewYork,
        type: RuleConditionType.Time,
      },
    ];

    render(
      <RuleSummary
        conditions={conditions}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={null}
      />,
    );

    expect(screen.getByText(/is after/)).toBeInTheDocument();
    expect(screen.getByText(/01\/15\/2024/)).toBeInTheDocument();
  });

  it('renders the fallback condition when there are no conditions', () => {
    render(
      <RuleSummary
        conditions={[]}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={null}
      />,
    );

    expect(screen.getByText('IF')).toBeInTheDocument();
    expect(screen.getByText('(no conditions defined)')).toBeInTheDocument();
  });

  it('renders a variation serve', () => {
    render(
      <RuleSummary
        conditions={[]}
        segments={segments}
        variations={variations}
        serveVariationId="variation-1"
        serveFractional={null}
      />,
    );

    expect(screen.getByText(/SERVE/)).toBeInTheDocument();
    expect(screen.getByText(/control/)).toBeInTheDocument();
  });

  it('renders a fractional serve', () => {
    render(
      <RuleSummary
        conditions={[]}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={{
          var: 'user',
          weights: [
            ['variation-1', 50],
            ['variation-2', 50],
          ],
        }}
      />,
    );

    expect(screen.getByText('WEIGHTED ROLLOUT')).toBeInTheDocument();
    expect(screen.getByText(/based on user/)).toBeInTheDocument();
    expect(screen.getByText(/50 control, 50 treatment/)).toBeInTheDocument();
  });

  it('does not render a serve when neither serve is provided', () => {
    render(
      <RuleSummary
        conditions={[]}
        segments={segments}
        variations={variations}
        serveVariationId={null}
        serveFractional={null}
      />,
    );

    expect(screen.queryByText('SERVE')).not.toBeInTheDocument();
    expect(screen.queryByText('WEIGHTED ROLLOUT')).not.toBeInTheDocument();
  });
});

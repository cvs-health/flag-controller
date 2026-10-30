// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { ActionType, Operator, RuleConditionType, SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { NaturalLanguageChange } from '../NaturalLanguageChange';

describe('NaturalLanguageChange', () => {
  it(`renders ${SubjectType.FeatureFlag} change`, () => {
    const change = { type: 'boolean', defaultVariation: 'on', description: 'desc' };

    render(
      <NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.FeatureFlag} change={change} />,
    );

    expect(screen.getByText('New feature flag created')).toBeInTheDocument();
    expect(screen.getByText(`as a type of ${change.type}`)).toBeInTheDocument();
    expect(screen.getByText(`The feature flag has a description of: "${change.description}".`)).toBeInTheDocument();
  });

  it(`renders ${SubjectType.Segment} change`, () => {
    const change = { description: 'desc' };

    render(<NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.Segment} change={change} />);

    expect(screen.getByText('New segment created')).toBeInTheDocument();
    expect(screen.getByText(`The segment has a description of: "${change.description}".`)).toBeInTheDocument();
  });

  it(`renders ${SubjectType.Team} change`, () => {
    const change = { name: 'my-team' };

    render(<NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.Team} change={change} />);

    expect(screen.getByText('New team created')).toBeInTheDocument();
    expect(screen.getByText(`with name of "${change.name}".`)).toBeInTheDocument();
  });

  it(`renders ${SubjectType.Rule} change, variation serve`, () => {
    const change = {
      serveVariationKey: 'on',
      serveVariationId: 'variation-id',
      conditions: [
        {
          context: 'user',
          attribute: 'id',
          operator: Operator.LooseEquals,
          values: '1',
          clause: 'if',
          type: RuleConditionType.Context,
        },
      ],
    };
    render(<NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.Rule} change={change} />);
    expect(screen.getByText('New rule created')).toBeInTheDocument();
    expect(screen.getByText('with 1 conditions.')).toBeInTheDocument();
    expect(screen.getByText(`The rule serves the variation "${change.serveVariationKey}" if:`)).toBeInTheDocument();
    expect(screen.getByText('context user.id equals 1')).toBeInTheDocument();
  });

  it(`renders ${SubjectType.Rule} change, fractional serve`, () => {
    const change = {
      serveFractionalId: 'fractional-id',
      conditions: [
        {
          context: 'user',
          attribute: 'id',
          operator: Operator.LooseEquals,
          values: '1',
          clause: 'if',
          type: RuleConditionType.Context,
        },
      ],
    };
    render(<NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.Rule} change={change} />);
    expect(screen.getByText('New rule created')).toBeInTheDocument();
    expect(screen.getByText('with 1 conditions.')).toBeInTheDocument();
    expect(screen.getByText('The rule serves a weighted rollout if:')).toBeInTheDocument();
    expect(screen.getByText('context user.id equals 1')).toBeInTheDocument();
  });

  it(`renders ${SubjectType.FeatureFlagEnvironment} change, enabled`, () => {
    const change = {
      defaultServeKey: 'desc',
      enabled: true,
    };
    render(
      <NaturalLanguageChange
        actionType={ActionType.Create}
        subjectType={SubjectType.FeatureFlagEnvironment}
        change={change}
      />,
    );
    expect(screen.getByText('New feature flag environment created')).toBeInTheDocument();
    expect(
      screen.getByText(
        `The feature flag environment has a default variation of "${change.defaultServeKey}" and is enabled.`,
      ),
    ).toBeInTheDocument();
  });

  it(`renders ${SubjectType.FeatureFlagEnvironment} change, disabled`, () => {
    const change = {
      defaultServeKey: 'desc',
      enabled: false,
    };
    render(
      <NaturalLanguageChange
        actionType={ActionType.Create}
        subjectType={SubjectType.FeatureFlagEnvironment}
        change={change}
      />,
    );
    expect(screen.getByText('New feature flag environment created')).toBeInTheDocument();
    expect(
      screen.getByText(
        `The feature flag environment has a default variation of "${change.defaultServeKey}" and is disabled.`,
      ),
    ).toBeInTheDocument();
  });

  it(`renders ${SubjectType.Variation} change`, () => {
    const change = {
      key: 'variation-key',
      value: 'test',
    };
    render(
      <NaturalLanguageChange actionType={ActionType.Create} subjectType={SubjectType.Variation} change={change} />,
    );
    expect(screen.getByText('New variation created')).toBeInTheDocument();
    expect(screen.getByText(`with key of ${change.key}`)).toBeInTheDocument();
    expect(screen.getByText(`The variation has a value of: "${change.value}".`)).toBeInTheDocument();
  });
});

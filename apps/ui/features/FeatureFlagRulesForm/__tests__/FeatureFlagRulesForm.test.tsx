// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import {
  Clause,
  type ContextRuleCondition,
  FeatureFlagType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type RulesJoined,
} from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlagRulesForm } from '../FeatureFlagRulesForm';

let navigationGuardCallCount = 0;
const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  push: vi.fn(),
  state: { status: 'idle', errorMessage: '', form: {}, parsed: {}, filterCount: 0 },
  refresh: vi.fn(),
  dispatch: vi.fn(),
  changesNavGuard: {
    active: false,
    accept: vi.fn(),
    reject: vi.fn(),
  },
  validationNavGuard: {
    active: false,
    accept: vi.fn(),
    reject: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }),
  usePathname: () => '/applications/applicationName/flags/feature-flag-key',
  useSearchParams: () => mocks.searchParams,
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn(() => [mocks.state, mocks.dispatch]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));
// This feels like overkill, but it's the only way I could get different return values for each call consistently
// since the hook is called twice in the component
vi.mock('next-navigation-guard', () => ({
  NavigationGuardProvider: ({ children }: PropsWithChildren) => children,
  useNavigationGuard: vi.fn().mockImplementation(() => {
    const guard = navigationGuardCallCount % 2 === 0 ? mocks.validationNavGuard : mocks.changesNavGuard;
    navigationGuardCallCount++;
    return guard;
  }),
}));

describe('FeatureFlagRulesForm', () => {
  const applicationId = 'application-id';
  const environmentId = 'environment-id';
  const featureFlagId = 'feature-flag-id';

  const variation = {
    applicationName: 'applicationName',
    createdAt: '',
    deletedAt: null,
    flagId: featureFlagId,
    flagKey: 'featureFlagKey',
    id: 'variation-1',
    key: 'yes',
    updatedAt: '',
    value: true,
  };
  const variation2 = {
    ...variation,
    key: 'no',
    value: false,
    id: 'variation-2',
  };

  const segment = {
    applicationId,
    createdAt: '2023-10-01T00:00:00Z',
    deletedAt: null,
    description: 'Segment Description',
    id: 'segment-1',
    key: 'some-segment-key',
    rules: [],
    updatedAt: '2023-10-01T00:00:00Z',
  };

  const baseContextCondition: ContextRuleCondition = {
    clause: Clause.If,
    operator: Operator.In,
    values: 'us',
    context: 'user',
    attribute: 'country',
    type: RuleConditionType.Context,
    valuesType: RuleConditionValueType.String,
  };

  const baseRule: RulesJoined = {
    conditions: [baseContextCondition],
    deletedAt: null,
    environmentId,
    flagId: featureFlagId,
    key: 'rule-key-1',
    segmentId: null,
    serveFractional: null,
    serveFractionalId: null,
    serveVariationId: variation2.id,
    serveVariationKey: variation2.key,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z',
    id: 'rule-1',
    orderPosition: 0,
  };

  afterEach(() => {
    navigationGuardCallCount = 0;
    mocks.changesNavGuard.active = false;
    mocks.validationNavGuard.active = false;
    mocks.dispatch.mockClear();
  });

  it('should mark an existing rule for removal', async () => {
    const rules = [
      baseRule,
      {
        ...baseRule,
        key: 'rule-key-2',
        id: 'rule-2',
        orderPosition: 1,
      },
    ];

    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={rules}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[segment]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getAllByLabelText('Remove rule')[0] as HTMLElement);

    expect(screen.getByText('Cancel removal')).toBeVisible();
  });

  it('should add and remove a new rule', async () => {
    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={[]}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[segment]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Add rule'));

    expect(screen.getByText('New Rule')).toBeVisible();

    await userEvent.click(screen.getAllByLabelText('Remove rule')[0] as HTMLElement);

    expect(screen.queryByText('New Rule')).toBeNull();
  });

  it('should dispatch the form action on submit', async () => {
    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={[]}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Save rules'));

    expect(mocks.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should not submit the form when Enter is pressed in an input', async () => {
    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={[]}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Add rule'));
    await userEvent.type(screen.getByLabelText('Rule key'), '{enter}');

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it('should update rule order positions when reordering rules', async () => {
    const rules = [
      {
        ...baseRule,
        key: 'rule-1',
        id: 'rule-1',
        orderPosition: 0,
        serveVariationId: variation.id,
      },
      {
        ...baseRule,
        key: 'rule-2',
        conditions: [
          {
            ...baseContextCondition,
            values: 'uk',
          },
        ],
        id: 'rule-2',
        orderPosition: 1,
        serveVariationId: variation2.id,
      },
      {
        ...baseRule,
        key: 'rule-3',
        conditions: [
          {
            ...baseContextCondition,
            values: 'fr',
          },
        ],
        id: 'rule-3',
        orderPosition: 2,
        serveVariationId: variation.id,
      },
    ];

    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={rules}
          featureFlagId={featureFlagId}
          segments={[segment]}
          variations={[variation, variation2]}
          featureFlagType={FeatureFlagType.Boolean}
        />
      </TestProviders>,
    );

    const sidebarRules = screen.getAllByText(/^[1-3]\.$/);
    expect(sidebarRules[0]).toHaveTextContent('1.');
    expect(sidebarRules[1]).toHaveTextContent('2.');
    expect(sidebarRules[2]).toHaveTextContent('3.');

    const mainContentBadges = document.querySelectorAll('[class*="orderPosition"]');
    expect(mainContentBadges[0]).toHaveTextContent('1');
    expect(mainContentBadges[1]).toHaveTextContent('2');
    expect(mainContentBadges[2]).toHaveTextContent('3');
  });

  it('should handle unsaved changes by presenting a modal', () => {
    mocks.validationNavGuard.active = false;
    mocks.changesNavGuard.active = true;

    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={[]}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    expect(screen.getByLabelText('Unsaved changes modal')).toBeVisible();
    expect(screen.getByText('Your rules have not been saved')).toBeVisible();
    expect(screen.getByText('If you want to keep the rule changes, the rules need to be saved.')).toBeVisible();
    expect(screen.getByText('Yes, save all rules')).toBeVisible();
    expect(screen.getByText("No, don't save the rules")).toBeVisible();
  });

  it('should handle validation unsaved changes by presenting a modal', () => {
    mocks.changesNavGuard.active = false;
    mocks.validationNavGuard.active = true;

    render(
      <TestProviders>
        <FeatureFlagRulesForm
          applicationId={applicationId}
          defaultVariationId={variation.id}
          environmentId={environmentId}
          existingRules={[]}
          featureFlagId={featureFlagId}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    expect(screen.getByLabelText('Unsaved changes modal')).toBeVisible();
    expect(screen.getByText('Your rules have not been saved')).toBeVisible();
    expect(
      screen.getByText(
        'A rule contains incomplete or invalid information and can’t be saved yet. If you leave this page now, your changes will be lost.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Discard changes')).toBeVisible();
    expect(screen.getByText('Stay and fix errors')).toBeVisible();
  });
});

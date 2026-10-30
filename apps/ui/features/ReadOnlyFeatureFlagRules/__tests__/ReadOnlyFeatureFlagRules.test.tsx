// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { TransitionFunction } from 'react';
import userEvent from '@testing-library/user-event';
import {
  Clause,
  FeatureFlagType,
  Operator,
  EnvironmentKey,
  RuleConditionType,
  RuleConditionValueType,
  type ContextRuleCondition,
} from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ReadOnlyFeatureFlagRules } from '../ReadOnlyFeatureFlagRules';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
  isTransitionPending: false,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/applications/applicationName/feature-flags/featureFlagKey',
  useSearchParams: () => mocks.searchParams,
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useTransition: vi.fn(() => [mocks.isTransitionPending, (action: TransitionFunction) => action()]),
}));

describe('ReadOnlyFeatureFlagRules', () => {
  it('should handle environment change', async () => {
    const variation = {
      applicationId: 'application-id',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'yes',
      updatedAt: '',
      value: true,
    };
    const variation2 = {
      ...variation,
      key: 'no',
      value: false,
      id: 'variation-id-2',
    };
    const rule = {
      createdAt: '2024-01-01T00:00:00.000Z',
      environmentId: 'environment-id',
      flagId: 'flag-id',
      updatedAt: '2024-01-01T00:00:00.000Z',
      segmentId: null,
      key: 'rule-key',
      conditions: [
        {
          attribute: 'country',
          clause: Clause.If,
          context: 'user',
          operator: Operator.In,
          type: RuleConditionType.Context,
          values: 'us',
          valuesType: RuleConditionValueType.String,
        } as ContextRuleCondition,
      ],
      id: 'rule-id',
      orderPosition: 0,
      serveVariationId: variation2.id,
      serveVariationKey: variation2.key,
      serveFractionalId: null,
      deletedAt: null,
      serveFractional: null,
    };
    const featureFlag = {
      defaultVariation: 'yes',
    };

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(resolvePromiseWithData(featureFlag))
      .mockResolvedValueOnce(resolvePromiseWithData([rule]));

    render(
      <TestProviders>
        <ReadOnlyFeatureFlagRules
          applicationId="application-id"
          defaultVariationKey={featureFlag.defaultVariation}
          defaultVariationId={variation.id}
          environmentKey={EnvironmentKey.Development}
          featureFlagRules={[rule]}
          featureFlagType={FeatureFlagType.Boolean}
          segments={[]}
          variations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Production'));

    expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
      '/applications/applicationName/feature-flags/featureFlagKey?rulesEnvironment=production',
      { scroll: false },
    );
    expect(screen.getAllByText(rule.key)).toHaveLength(2);
    expect(screen.getByText(featureFlag.defaultVariation)).toBeInTheDocument();
  });
});

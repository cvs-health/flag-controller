// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Clause,
  type ContextRuleCondition,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type RulesJoined,
} from 'shared-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { SegmentRules } from '../SegmentRules';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn(() => [{ status: 'idle', errorMessage: '' }, mocks.dispatch]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/applications/application-id/segments/segment-id',
  useSearchParams: () => mocks.searchParams,
}));

describe('SegmentRules', () => {
  const applicationId = 'application-id';
  const environmentId = 'environment-id';
  const segmentId = 'segment-id';

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({}));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle the save of the rule', async () => {
    const condition: ContextRuleCondition = {
      clause: Clause.If,
      operator: Operator.In,
      values: 'us',
      context: 'user',
      attribute: 'country',
      type: RuleConditionType.Context,
      valuesType: RuleConditionValueType.String,
    };

    const existingRules: RulesJoined[] = [
      {
        createdAt: '2023-10-01T00:00:00Z',
        deletedAt: null,
        environmentId,
        flagId: null,
        key: 'rule-key',
        conditions: [condition],
        id: 'rule-1',
        segmentId,
        orderPosition: 0,
        serveVariationId: null,
        serveVariationKey: null,
        serveFractionalId: null,
        serveFractional: null,
        updatedAt: '2023-10-01T00:00:00Z',
      },
    ];

    render(
      <TestProviders>
        <SegmentRules
          applicationId={applicationId}
          environmentId={environmentId}
          existingRules={existingRules}
          segmentId={segmentId}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Save'));

    expect(mocks.dispatch).toHaveBeenCalledTimes(1);
    const submittedFormData = mocks.dispatch.mock.calls[0]?.[0] as FormData;
    const submitted = Object.fromEntries(submittedFormData.entries());

    expect(submitted).toMatchObject({
      applicationId,
      environmentId,
      segmentId,
      rules: JSON.stringify(existingRules),
    });
  });
});

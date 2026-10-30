// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { Operator } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SegmentRuleConditional } from '../../../typings/rules';
import { SegmentRuleCondition } from '../SegmentRuleCondition';

describe('SegmentRuleCondition', () => {
  it('should populate form with default values', async () => {
    const onRemove = vi.fn();

    render(
      <SegmentRuleCondition
        id="condition-1"
        conditional={SegmentRuleConditional.IfContext}
        onRemove={onRemove}
        operator={Operator.In}
        position={0}
        ruleId="rule-id"
        segmentId="segment-1"
        segments={[
          {
            applicationId: 'app-1',
            createdAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
            description: 'Test segment',
            id: 'segment-1',
            key: 'segment-key-1',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByDisplayValue('is in')).toBeInTheDocument();
    expect(screen.getByDisplayValue('segment-key-1')).toBeInTheDocument();
  });

  it('should handle removing a condition', async () => {
    const onRemove = vi.fn();

    render(
      <SegmentRuleCondition
        id="condition-2"
        conditional={SegmentRuleConditional.IfContext}
        onRemove={onRemove}
        operator={Operator.In}
        position={1}
        ruleId="rule-id"
        segmentId="segment-1"
        segments={[
          {
            id: 'segment-1',
            key: 'segment-key-1',
            createdAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
            applicationId: 'app-1',
            updatedAt: '2024-01-01T00:00:00Z',
            description: 'Test segment 1',
          },
        ]}
      />,
    );

    await userEvent.click(screen.getByText('Remove condition'));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith('condition-2');
  });

  it('should handle no available segment selection', async () => {
    const onRemove = vi.fn();

    render(
      <SegmentRuleCondition
        id="condition-3"
        conditional={SegmentRuleConditional.IfContext}
        onRemove={onRemove}
        operator={Operator.In}
        position={1}
        ruleId="rule-id"
        segmentId=""
        segments={[]}
      />,
    );

    expect(
      screen.getByText(
        'No segments available. Create or add conditions to an existing segment for this application in order to update this rule.',
      ),
    ).toBeInTheDocument();
  });
});

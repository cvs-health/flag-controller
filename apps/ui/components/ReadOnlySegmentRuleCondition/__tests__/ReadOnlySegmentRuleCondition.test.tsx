// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Operator } from 'shared-types';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ReadOnlySegmentRuleCondition } from '../ReadOnlySegmentRuleCondition';
import { SegmentRuleConditional } from '../../../typings/rules';

describe('ReadOnlySegmentRuleCondition', () => {
  it('should render the condition', async () => {
    render(
      <ReadOnlySegmentRuleCondition
        conditional={SegmentRuleConditional.IfContext}
        operator={Operator.LooseEquals}
        segmentKey="segmentKey"
      />,
    );

    expect(screen.getByText('is in')).toBeInTheDocument();
    expect(screen.getByText('segmentKey')).toBeInTheDocument();
  });
});

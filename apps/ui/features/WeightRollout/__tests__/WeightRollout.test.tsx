// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeightRollout } from '../WeightRollout';

describe('WeightRollout', () => {
  const variation = {
    id: '1',
    key: 'variation-key',
    value: 'variation-value',
    applicationName: 'application',
    createdAt: '',
    updatedAt: '',
    flagKey: 'flag-key',
    flagId: 'flag-id',
    deletedAt: null,
  };

  it('should render with weights', () => {
    const variations = [variation, { ...variation, id: '2', key: 'variation-key-2' }];

    render(
      <WeightRollout
        ruleOrderPosition={0}
        varValue="user.country"
        weights={[
          ['1', 49],
          ['2', 50],
        ]}
        variations={variations}
      />,
    );

    expect(screen.getByLabelText('variation-key')).toHaveValue(49);
    expect(screen.getByLabelText('variation-key-2')).toHaveValue(50);
  });

  it('should render context and attribute from varValue', () => {
    const variations = [variation, { ...variation, id: '2', key: 'variation-key-2' }];

    render(
      <WeightRollout
        ruleOrderPosition={0}
        varValue="user.country"
        weights={[
          ['1', 49],
          ['2', 50],
        ]}
        variations={variations}
      />,
    );

    expect(screen.getByDisplayValue('user')).toBeInTheDocument();
    expect(screen.getByDisplayValue('country')).toBeInTheDocument();
  });

  it('should validate context and attribute on blur', () => {
    const variations = [variation, { ...variation, id: '2', key: 'variation-key-2' }];

    render(
      <WeightRollout
        ruleOrderPosition={0}
        varValue="user.country"
        weights={[
          ['1', 49],
          ['2', 50],
        ]}
        variations={variations}
      />,
    );

    const contextInput = screen.getByLabelText('Context');
    const attributeInput = screen.getByLabelText('Attribute');

    fireEvent.blur(contextInput, { target: { value: 'user context' } });
    fireEvent.blur(attributeInput, { target: { value: 'address..city' } });

    expect(screen.getByText('Context must not contain whitespace.')).toBeInTheDocument();
    expect(
      screen.getByText('Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.'),
    ).toBeInTheDocument();

    fireEvent.blur(contextInput, { target: { value: 'user' } });
    fireEvent.blur(attributeInput, { target: { value: 'address.city' } });

    expect(screen.queryByText('Context must not contain whitespace.')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.'),
    ).not.toBeInTheDocument();
  });
});

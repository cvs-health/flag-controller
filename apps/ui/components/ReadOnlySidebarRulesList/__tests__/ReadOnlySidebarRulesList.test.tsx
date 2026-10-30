// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReadOnlySidebarRulesList } from '../ReadOnlySidebarRulesList';
import TestProviders from '../../../test/TestProviders';

describe('ReadOnlySidebarRulesList', () => {
  it('should render rules and allow clicking to navigate', () => {
    const rules = [
      { id: 'rule-id', key: 'rule-1' },
      { id: 'rule-id-2', key: 'rule-2' },
      { id: 'rule-id-3', key: '' },
    ];

    render(
      <TestProviders>
        <ReadOnlySidebarRulesList rules={rules} />
      </TestProviders>,
    );

    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('rule-1')).toBeInTheDocument();
    expect(screen.getByText('rule-2')).toBeInTheDocument();
    expect(screen.getByText('New rule')).toBeInTheDocument();
    expect(screen.getByText('default rule')).toBeInTheDocument();
    expect(screen.getByText('rule-1').closest('a')).toHaveAttribute('href', '#rule-rule-id');
    expect(screen.getByText('rule-2').closest('a')).toHaveAttribute('href', '#rule-rule-id-2');
    expect(screen.getByText('default rule').closest('a')).toHaveAttribute('href', '#default-rule');
  });
});

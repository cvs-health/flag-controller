// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarRulesList } from '../SidebarRulesList';
import TestProviders from '../../../test/TestProviders';

describe('SidebarRulesList', () => {
  const mockRules = [
    { id: 'rule-id', key: 'rule-1' },
    { id: 'rule-id-2', key: 'rule-2' },
    { id: 'rule-id-3', key: '' }, // Rule without key should show "New rule"
  ];
  const mockOnReorderRules = vi.fn();

  it('should render rules and allow clicking to navigate', () => {
    render(
      <TestProviders>
        <SidebarRulesList rules={mockRules} onReorderRules={mockOnReorderRules} />
      </TestProviders>,
    );

    // Verify rules are displayed
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('rule-1')).toBeInTheDocument();
    expect(screen.getByText('rule-2')).toBeInTheDocument();
    expect(screen.getByText('New rule')).toBeInTheDocument();
    expect(screen.getByText('default rule')).toBeInTheDocument();

    // Verify navigation links are created
    expect(screen.getByText('rule-1').closest('a')).toHaveAttribute('href', '#rule-rule-id');
    expect(screen.getByText('rule-2').closest('a')).toHaveAttribute('href', '#rule-rule-id-2');
    expect(screen.getByText('default rule').closest('a')).toHaveAttribute('href', '#default-rule');
  });

  it('should display drag and drop description', () => {
    render(
      <TestProviders>
        <SidebarRulesList rules={mockRules} onReorderRules={mockOnReorderRules} />
      </TestProviders>,
    );

    expect(screen.getByText('Drag and drop rules to adjust the order')).toBeInTheDocument();
  });

  it('should display drag handles for each rule', () => {
    const { container } = render(
      <TestProviders>
        <SidebarRulesList rules={mockRules} onReorderRules={mockOnReorderRules} />
      </TestProviders>,
    );

    const dragHandles = container.querySelectorAll('svg');
    expect(dragHandles.length).toBe(3);
  });

  it('should hide drag and drop description', () => {
    const singleRule = [{ id: 'rule-id', key: 'rule-1' }];

    render(
      <TestProviders>
        <SidebarRulesList rules={singleRule} onReorderRules={mockOnReorderRules} />
      </TestProviders>,
    );

    expect(screen.queryByText('Drag and drop rules to adjust the order')).not.toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SidebarDefaultRuleItem } from '../SidebarDefaultRuleItem';

describe('SidebarDefaultRuleItem', () => {
  it('should render', () => {
    render(<SidebarDefaultRuleItem />);

    expect(screen.getByText('default rule')).toBeInTheDocument();
  });
});

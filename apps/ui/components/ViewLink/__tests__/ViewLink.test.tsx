// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ViewLink } from '../ViewLink';

describe('ViewLink', () => {
  it('renders the link with the correct URL for type "team"', () => {
    render(<ViewLink type="team" value="123" />);

    expect(screen.getByText('View team')).toHaveAttribute('href', '/teams/123');
  });

  it('renders the link with the correct URL for type "application"', () => {
    render(<ViewLink type="application" value="456" />);

    expect(screen.getByText('View application')).toHaveAttribute('href', '/applications/456');
  });
});

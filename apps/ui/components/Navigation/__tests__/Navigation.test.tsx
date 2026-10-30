// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { Navigation } from '../Navigation';

const mocks = vi.hoisted(() => ({
  pathname: '/flags',
}));
vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

describe('Navigation', () => {
  it('handles active item based on the pathname', async () => {
    const items: Record<string, [string, string, string[]]> = {
      flags: ['/flags', 'Flags', ['/flags', '/applications/application-name/flags/flag-key']],
      segments: ['/segments', 'Segments', ['/segments', '/applications/application-name/segments/segment-key']],
      applications: ['/applications', 'Applications', ['/applications/application-name', '/applications']],
      teams: ['/teams', 'Teams', ['/teams/team-name', '/teams']],
      logs: ['/logs', 'Logs', ['/logs']],
    };

    const { rerender } = render(<Navigation />);

    for (const [, [href, label, validPathnames]] of Object.entries(items)) {
      await userEvent.click(screen.getByRole('link', { name: label }));

      expect(window.location.pathname).toEqual(href);

      for (const pathname of validPathnames) {
        mocks.pathname = pathname;

        rerender(<Navigation />);

        expect(screen.getByRole('link', { current: true })).toHaveTextContent(label);
      }
    }
  });
});

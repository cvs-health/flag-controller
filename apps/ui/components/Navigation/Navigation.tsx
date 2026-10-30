// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { HeaderMenuItem, HeaderNavigation } from '../Carbon';

export function Navigation() {
  const navigationItems: Record<string, [string, string, RegExp]> = {
    flags: ['/flags', 'Flags', /^(\/flags|\/applications\/.+\/flags\/.+)$/],
    segments: ['/segments', 'Segments', /^(\/segments|\/applications\/.+\/segments\/.+)$/],
    applications: ['/applications', 'Applications', /^(\/applications|\/applications\/[^/]+)$/],
    teams: ['/teams', 'Teams', /^(\/teams|\/teams\/[^/]+)$/],
    logs: ['/logs', 'Logs', /^\/logs$/],
  };
  const pathname = usePathname();

  return (
    <HeaderNavigation aria-label="Navigation">
      {Object.entries(navigationItems).map(([key, [href, label, pattern]]) => (
        <HeaderMenuItem as={Link} href={href} isActive={!!pathname?.match(pattern)} key={key}>
          {label}
        </HeaderMenuItem>
      ))}
    </HeaderNavigation>
  );
}

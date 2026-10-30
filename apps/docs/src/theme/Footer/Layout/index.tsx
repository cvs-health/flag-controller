// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import type { Props } from '@theme/Footer/Layout';

export default function FooterLayout({ links, logo, copyright }: Props): ReactNode {
  return (
    <footer
      className={clsx(
        ThemeClassNames.layout.footer.container,
        'bg-white dark:bg-dark-bg border-t border-t-white-off dark:border-t-dark-card-border pt-16',
      )}
    >
      <div className="container container-fluid">
        <div className="min-h-52 mb-12">
          <div className="w-1/4 mb-8">
            {logo}
            <p>The open source feature flag platform that scales with your team.</p>
          </div>
          {links}
        </div>
        <div className="flex justify-between items-center border-t border-t-white-off dark:border-t-dark-card-border py-8 text-sm">
          {copyright && <span>{copyright}</span>}
          <div className="flex gap-6 items-center" />
        </div>
      </div>
    </footer>
  );
}

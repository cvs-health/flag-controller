// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import '@carbon/charts-react/styles.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import './globals.scss';
import Providers from './providers';
import getPathname from '../utils/getPathname';
import getSession from '../api/requests/getSession';
import styles from './layout.module.css';
import { Header } from '../components/Header/Header';

export const metadata: Metadata = {
  title: 'Feature Flag UI',
  description: 'Feature flags management UI',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const [pathname, session] = await Promise.all([getPathname(), getSession()]);

  if (!session && pathname !== '/login') {
    redirect('/login');
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          <Header authenticated={!!session} />
          <main className={styles.main}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

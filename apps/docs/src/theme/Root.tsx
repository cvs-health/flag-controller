// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren } from 'react';

import Providers from '../components/Providers';

export default function RootLayout({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}

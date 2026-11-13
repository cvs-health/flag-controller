// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { NavigationGuardProvider } from 'next-navigation-guard';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import '../i18n';
import { IdentityModesProvider } from '../features/IdentityModes/IdentityModes';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <IdentityModesProvider>
        <OpenFeatureProvider>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </OpenFeatureProvider>
      </IdentityModesProvider>
    </QueryClientProvider>
  );
}

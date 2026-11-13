// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { NavigationGuardProvider } from 'next-navigation-guard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type JsonValue, OpenFeatureTestProvider } from '@openfeature/react-sdk';
import { type ReactNode, useState } from 'react';
import type { IdentityModes } from 'shared-types';

import { IdentityModesContext, localModes } from '../features/IdentityModes/IdentityModes';

interface ProvidersProps {
  children: ReactNode;
  featureFlags?: Record<string, JsonValue>;
  /** Overrides the identity modes, which are all local otherwise. */
  identityModes?: Partial<IdentityModes>;
}

function TestProviders({ children, featureFlags = {}, identityModes }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <OpenFeatureTestProvider flagValueMap={featureFlags}>
        <IdentityModesContext value={{ ...localModes, ...identityModes }}>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </IdentityModesContext>
      </OpenFeatureTestProvider>
    </QueryClientProvider>
  );
}

export default TestProviders;

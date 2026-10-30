// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { NavigationGuardProvider } from 'next-navigation-guard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type JsonValue, OpenFeatureTestProvider } from '@openfeature/react-sdk';
import { type ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
  featureFlags?: Record<string, JsonValue>;
}

function TestProviders({ children, featureFlags = {} }: ProvidersProps) {
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
        <NavigationGuardProvider>{children}</NavigationGuardProvider>
      </OpenFeatureTestProvider>
    </QueryClientProvider>
  );
}

export default TestProviders;

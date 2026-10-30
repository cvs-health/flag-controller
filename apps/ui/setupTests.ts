// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { loadEnvConfig } from '@next/env';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import type { PropsWithChildren, ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
import { afterEach, beforeEach, vi } from 'vitest';

export const sessionToken = 'sessiontoken';
process.env.TZ = 'US/Eastern';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

userEvent.setup();

// Find unmocked fetch calls in tests.
// This is useful for catching accidental network requests in unit tests
// $ pnpm --filter ui test 2>&1 | grep -iE "fetch|econnrefused|enotfound|timeout"
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((input) => {
    throw new Error(`Unmocked fetch: ${String(input)}. Mock it in the test.`);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock('next/headers', () => {
  return {
    headers: () => Promise.resolve(new Headers({ cookie: '', 'x-next-url-pathname': '/test' })),
  };
});

vi.mock('next-navigation-guard', () => ({
  NavigationGuardProvider: ({ children }: PropsWithChildren): ReactNode => children,
  useNavigationGuard: vi.fn(() => ({
    canNavigate: true,
    reject: vi.fn(),
    accept: vi.fn(),
  })),
}));

vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({
    useSession: () => ({
      data: {
        user: {
          id: 'user-id',
          applications: ['codenamekidsnextdoor'],
        },
      },
    }),
    signIn: { social: vi.fn(), email: vi.fn() },
    signOut: vi.fn(),
  }),
}));

// See https://react.i18next.com/misc/testing
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

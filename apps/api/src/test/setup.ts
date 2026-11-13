// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { BetterAuthOptions } from 'better-auth/types';
import { vi } from 'vitest';

import { initializeAuthConfig } from '../utils/getAuthConfig.js';

// Set explicitly so a local .env can't override them.
process.env.AUTH_PROVIDER = 'github';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
// Normally done by main(), which tests skip.
initializeAuthConfig();

export const sessionToken = 'sessiontoken';

export const userTeam = {
  id: '123',
  name: 'Team 1',
};
export const user = {
  createdAt: new Date(),
  email: 'testuser@email.com',
  emailVerified: true,
  id: '123',
  name: 'Test User',
  updatedAt: new Date(),
};

vi.mock('better-auth/minimal', () => ({
  betterAuth: (options: BetterAuthOptions) => ({
    api: {
      addMember: vi.fn(),
      addTeamMember: vi.fn(),
      createOrganization: vi.fn(),
      getSession: () => ({
        user: {
          id: '123',
          name: 'Test User',
          email: 'testuser@email.com',
        },
      }),
      listUserTeams: () => [
        {
          id: '123',
          name: 'Team 1',
        },
      ],
      removeTeamMember: vi.fn(),
    },
    options,
  }),
}));

vi.mock('better-auth/plugins', () => ({
  organization: vi.fn(() => ({})),
}));

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { readIdentityConfig } from '../readIdentityConfig.js';

const everything = ['users', 'teams', 'applications'] as const;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('readIdentityConfig', () => {
  it('defaults every entity to local and joins new users to the default team', () => {
    expect(readIdentityConfig()).toEqual({
      modes: { users: 'local', teams: 'local', applications: 'local' },
      defaultTeam: true,
    });
  });

  it('reads each mode', () => {
    vi.stubEnv('IDENTITY_USERS_MODE', 'external');
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');
    vi.stubEnv('IDENTITY_APPLICATIONS_MODE', 'external');

    expect(readIdentityConfig(everything).modes).toEqual({
      users: 'external',
      teams: 'external',
      applications: 'external',
    });
  });

  it('turns the default team off when IDENTITY_TEAMS_MODE=external', () => {
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');

    expect(readIdentityConfig(everything).defaultTeam).toBe(false);
  });

  it('lets IDENTITY_DEFAULT_TEAM=false opt out when everything is local', () => {
    vi.stubEnv('IDENTITY_DEFAULT_TEAM', 'false');

    expect(readIdentityConfig().defaultTeam).toBe(false);
  });

  it('fails IDENTITY_DEFAULT_TEAM=true when the IdP owns teams, because no default team is created', () => {
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');
    vi.stubEnv('IDENTITY_DEFAULT_TEAM', 'true');

    expect(() => readIdentityConfig(everything)).toThrow('IDENTITY_DEFAULT_TEAM=true needs IDENTITY_TEAMS_MODE=local');
  });

  it('fails an external mode while no provisioning source exists, naming each one', () => {
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');
    vi.stubEnv('IDENTITY_APPLICATIONS_MODE', 'external');

    expect(() => readIdentityConfig()).toThrow(
      'Invalid auth configuration: IDENTITY_TEAMS_MODE=external, IDENTITY_APPLICATIONS_MODE=external needs a provisioning source, and none is configured for it',
    );
  });

  it('fails an external mode whose entity the configured source does not provision', () => {
    vi.stubEnv('IDENTITY_USERS_MODE', 'external');
    vi.stubEnv('IDENTITY_TEAMS_MODE', 'external');

    expect(() => readIdentityConfig(['users'])).toThrow(
      'IDENTITY_TEAMS_MODE=external needs a provisioning source, and none is configured for it',
    );
  });

  it.each([
    ['IDENTITY_TEAMS_MODE', 'blended', 'IDENTITY_TEAMS_MODE must be one of local, external, got "blended"'],
    ['IDENTITY_USERS_MODE', 'scim', 'IDENTITY_USERS_MODE must be one of local, external, got "scim"'],
    ['IDENTITY_DEFAULT_TEAM', 'yes', 'IDENTITY_DEFAULT_TEAM must be true or false, got "yes"'],
  ])('rejects %s=%s', (name, value, message) => {
    vi.stubEnv(name, value);

    expect(() => readIdentityConfig(everything)).toThrow(message);
  });
});

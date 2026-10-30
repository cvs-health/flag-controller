// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import createTeam from '../createTeam';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import type { authClient } from '../../lib/auth-client';
import { ActionStatus } from '../../typings/common';

const mocks = vi.hoisted(() => ({
  team: { name: 'team-name' } as ReturnType<(typeof authClient)['organization']['createTeam']>,
}));

vi.mock('better-auth/react', () => ({
  createAuthClient: () => ({
    organization: {
      createTeam: () => mocks.team,
    },
  }),
}));

describe('createTeam', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const initialFormState = {
    form: {
      teamName: '',
    },
    status: ActionStatus.Idle,
  };
  const session = {
    session: {
      activeOrganizationId: '1',
    },
  };

  it('should create a team successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(session));
    const formData = new FormData();

    formData.append('teamName', 'team-name');

    const result = await createTeam(initialFormState, formData);

    expect(result).toEqual({
      form: {
        teamName: 'team-name',
      },
      status: ActionStatus.Success,
    });
  });

  it('should handle validation error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(session));

    const formData = new FormData();

    formData.append('teamName', '');

    const result = await createTeam(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      errors: {
        fieldErrors: {
          teamName: [
            'Team name is required.',
            'Format should follow a lowercase, kebab-case convention (ex. my-team-name).',
          ],
        },
        formErrors: [],
      },
      status: ActionStatus.Error,
    });
  });

  it('should handle create team error', async () => {
    mocks.team = { error: true };
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData(session));

    const formData = new FormData();

    formData.append('teamName', 'team-name');

    const result = await createTeam(initialFormState, formData);

    expect(result).toEqual({
      ...initialFormState,
      form: {
        teamName: 'team-name',
      },
      errors: {
        actionError: {
          subtitle: 'Failed to create a team. Please try again later.',
          title: 'System error',
        },
      },
      status: ActionStatus.Error,
    });
  });
});

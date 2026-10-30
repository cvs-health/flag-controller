// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthorizationService } from '../authorizationService.js';
import { AuthorizationDenialReason } from '../authorizationService.js';
import { ForbiddenError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';

const teams = mockRepositories.teamsRepository;
const applications = mockRepositories.applicationsRepository;
const segments = mockRepositories.segmentsRepository;
const rules = mockRepositories.rulesRepository;

describe('createAuthorizationService', () => {
  let service: AuthorizationService;

  beforeEach(() => {
    service = createServiceWithMocks.authorization;
    // The caller (user-1) belongs to team-1 by default.
    vi.mocked(teams.getAccessScope).mockResolvedValue({ teamIds: ['team-1'] });
  });

  describe('assertCanWrite', () => {
    it('resolves when the caller is a member of the owning team', async () => {
      vi.mocked(segments.findOwningTeamId).mockResolvedValue('team-1');

      await expect(service.assertCanWrite('user-1', 'segment', 'seg-1')).resolves.toBeUndefined();

      expect(teams.getAccessScope).toHaveBeenCalledWith('user-1');
      expect(segments.findOwningTeamId).toHaveBeenCalledWith('seg-1');
    });

    it('treats a team id as the identity case (no owner lookup)', async () => {
      await expect(service.assertCanWrite('user-1', 'team', 'team-1')).resolves.toBeUndefined();
    });

    it('authorizes a batch when every id belongs to a team the caller is in', async () => {
      vi.mocked(rules.findOwningTeamId).mockResolvedValue('team-1');

      await expect(service.assertCanWrite('user-1', 'rule', ['rule-1', 'rule-2'])).resolves.toBeUndefined();

      expect(rules.findOwningTeamId).toHaveBeenCalledWith('rule-1');
      expect(rules.findOwningTeamId).toHaveBeenCalledWith('rule-2');
    });

    it('denies when the caller is not a member of the owning team', async () => {
      vi.mocked(applications.findOwningTeamId).mockResolvedValue('team-2');

      await expect(service.assertCanWrite('user-1', 'application', 'app-1')).rejects.toMatchObject({
        name: 'ForbiddenError',
        context: { reason: AuthorizationDenialReason.NotAMember, teamId: 'team-2' },
      });
    });

    it('denies a batch when any id belongs to a team the caller is not in', async () => {
      vi.mocked(rules.findOwningTeamId).mockImplementation(async (id) => (id === 'rule-1' ? 'team-1' : 'team-2'));

      await expect(service.assertCanWrite('user-1', 'rule', ['rule-1', 'rule-2'])).rejects.toBeInstanceOf(
        ForbiddenError,
      );
    });

    it('fails closed with UnresolvedOwner when the id resolves to no team', async () => {
      vi.mocked(applications.findOwningTeamId).mockResolvedValue(null);

      await expect(service.assertCanWrite('user-1', 'application', 'ghost')).rejects.toMatchObject({
        name: 'ForbiddenError',
        context: { reason: AuthorizationDenialReason.UnresolvedOwner },
      });
    });

    it('is a no-op for an empty batch', async () => {
      await expect(service.assertCanWrite('user-1', 'rule', [])).resolves.toBeUndefined();

      expect(rules.findOwningTeamId).not.toHaveBeenCalled();
    });

    it('dedupes repeated ids so each unique id is looked up once', async () => {
      vi.mocked(rules.findOwningTeamId).mockResolvedValue('team-1');

      await service.assertCanWrite('user-1', 'rule', ['rule-1', 'rule-1', 'rule-2', 'rule-1']);

      expect(rules.findOwningTeamId).toHaveBeenCalledTimes(2);
      expect(rules.findOwningTeamId).toHaveBeenCalledWith('rule-1');
      expect(rules.findOwningTeamId).toHaveBeenCalledWith('rule-2');
    });
  });
});

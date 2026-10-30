// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { TeamsTableColumns } from 'shared-types';
import useGetUserTeamsQuery, { getUserTeamsQueryKey } from '../../api/queries/useGetUserTeamsQuery';
import { Hero } from '../../components/Hero/Hero';
import { MenuButton, MenuItem } from '../../components/Carbon';
import { RemoveTeamModal } from '../RemoveTeamModal/RemoveTeamModal';
import { authClient } from '../../lib/auth-client';
import { getTeamsQueryKey } from '../../api/queries/useGetTeamsQuery';

interface TeamHeroProps {
  teamName: string;
}

export function TeamHero({ teamName }: TeamHeroProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const getUserTeamsQuery = useGetUserTeamsQuery(session.data?.user.id || '');
  const [teamForRemove, setTeamForRemove] = useState<Pick<TeamsTableColumns, 'id' | 'name'> | null>(null);

  const teamInQuery = getUserTeamsQuery.data?.data.find((t) => t.name === teamName);

  function handleOpenRemoveTeamModal() {
    if (teamInQuery) setTeamForRemove(teamInQuery);
  }

  function handleCloseRemoveTeamModal() {
    setTeamForRemove(null);
  }

  const handleRemoveTeamSuccess = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [getTeamsQueryKey] });
    await queryClient.invalidateQueries({ queryKey: [getUserTeamsQueryKey, session.data?.user.id] });
    router.push('/teams');
  }, [queryClient, router, session.data?.user.id]);

  return (
    <>
      <Hero
        details={[
          {
            label: 'Team',
            data: teamName,
          },
        ]}
      >
        <MenuButton label="Actions" menuAlignment="bottom" kind="tertiary">
          <MenuItem
            kind="danger"
            disabled={getUserTeamsQuery.isPending || !teamInQuery}
            label="Remove team"
            shortcut="⌫"
            onClick={handleOpenRemoveTeamModal}
          />
        </MenuButton>
      </Hero>
      {teamForRemove && (
        <RemoveTeamModal
          open
          onClose={handleCloseRemoveTeamModal}
          onSuccess={handleRemoveTeamSuccess}
          team={teamForRemove}
        />
      )}
    </>
  );
}

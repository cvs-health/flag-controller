// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
} from '@carbon/react';
import { Delete, Add } from '@carbon/icons-react';
import { DesignResearch, FaceVeryDissatisfied, Group } from '@carbon/pictograms-react';
import type { Team } from 'better-auth/plugins';

import useGetTeamsQuery, { getTeamsQueryKey } from '../../api/queries/useGetTeamsQuery';
import useTableParams from '../../hooks/useTableParams';
import { ActionTableCell } from '../../components/ActionTableCell/ActionTableCell';
import { CreateTeamModal } from '../CreateTeamModal/CreateTeamModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { RemoveTeamModal } from '../RemoveTeamModal/RemoveTeamModal';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

export function TeamsTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tableParams = useTableParams();
  const getTeamsQuery = useGetTeamsQuery(tableParams.pagination);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [teamToRemove, setTeamToRemove] = useState<Pick<Team, 'id' | 'name'> | null>(null);
  const rows =
    getTeamsQuery.data?.data.map((team) => ({
      id: team.id,
      application: team.applications.map((application, index) => (
        <span key={application.id}>
          <Link href={`/applications/${application.name}`}>{application.name}</Link>
          {index !== team.applications.length - 1 ? ', ' : ''}
        </span>
      )),
      team: <Link href={`/teams/${team.name}`}>{team.name}</Link>,
    })) || [];
  const headers = [
    {
      header: 'Team',
      key: 'team',
    },
    {
      header: 'Application',
      key: 'application',
    },
  ];

  function toggleCreateTeamModal() {
    setCreateTeamModalOpen(!createTeamModalOpen);
  }

  function handleRemoveTeamClick(teamId: string) {
    const team = getTeamsQuery.data?.data.find((team) => team.id === teamId);

    if (team) {
      setTeamToRemove({ id: team.id, name: team.name });
    }
  }

  function handleRemoveTeamModalClose() {
    setTeamToRemove(null);
  }

  const handleRemoveTeamSuccess = useCallback(() => {
    setTeamToRemove(null);
    void queryClient.invalidateQueries({ queryKey: [getTeamsQueryKey] });
    router.refresh();
  }, [queryClient, router]);

  function handleCreateTeamSuccess(teamName: string) {
    router.push(`/teams/${teamName}`);
  }

  return (
    <>
      <TableContainer title="All Teams">
        <TableToolbar>
          <TableToolbarContent>
            <Button type="button" onClick={toggleCreateTeamModal} size="lg" renderIcon={Add}>
              Create team
            </Button>
          </TableToolbarContent>
        </TableToolbar>
        <DataTable rows={rows} headers={headers} size="xl">
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {getTeamsQuery.fetchStatus === 'fetching' ? (
                  <SkeletonTable rowCount={10} columnCount={headers.length + 1} />
                ) : (
                  rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <ActionTableCell
                        key={`${row.id}-actions`}
                        rowId={row.id}
                        items={[
                          {
                            label: 'Remove team',
                            icon: Delete,
                            onClick: () => handleRemoveTeamClick(row.id),
                            isDelete: true,
                          },
                        ]}
                      />
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </DataTable>
        {getTeamsQuery.isError && (
          <EmptyState
            icon={FaceVeryDissatisfied}
            title="Something's wrong"
            body="We were unable to connect to the service. Please try again later."
          />
        )}
        {getTeamsQuery.isSuccess && !getTeamsQuery.data?.data.length && tableParams.search ? (
          <EmptyState
            icon={DesignResearch}
            title="No results found"
            body="Try adjusting your search to find what you're looking for."
          />
        ) : null}
        {getTeamsQuery.isSuccess && !getTeamsQuery.data?.data.length && !tableParams.search ? (
          <EmptyState
            icon={Group}
            title="There are no teams assigned to you yet"
            body="Create a new team and add an application to start creating flags."
          />
        ) : null}
        <Pagination
          onChange={tableParams.updatePagination}
          page={tableParams.pagination.page}
          pageSize={tableParams.pagination.rows}
          pageSizes={[10, 20, 50]}
          totalItems={getTeamsQuery.data?.metadata.totalRecords}
        />
      </TableContainer>
      {createTeamModalOpen && (
        <CreateTeamModal open onClose={toggleCreateTeamModal} onSuccess={handleCreateTeamSuccess} />
      )}
      {teamToRemove && (
        <RemoveTeamModal
          open
          onClose={handleRemoveTeamModalClose}
          onSuccess={handleRemoveTeamSuccess}
          team={teamToRemove}
        />
      )}
    </>
  );
}

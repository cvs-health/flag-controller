// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useState } from 'react';
import { Add, Delete } from '@carbon/icons-react';
import {
  Button,
  DataTable,
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
import { User } from '@carbon/pictograms-react';
import { useQueryClient } from '@tanstack/react-query';

import useGetTeamMembersQuery, { getTeamMembersQueryKey } from '../../api/queries/useGetTeamMembersQuery';
import useTableParams from '../../hooks/useTableParams';
import { ActionTableCell } from '../../components/ActionTableCell/ActionTableCell';
import { AddMembersModal } from '../AddMembersModal/AddMembersModal';
import { ColumnSortingDirection } from '../../typings/api';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { RemoveMemberModal } from '../RemoveMemberModal/RemoveMemberModal';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface MembersTableProps {
  teamId: string;
}

const headers = [
  { header: 'Member name', key: 'name' },
  { header: 'Email', key: 'email' },
];

export function MembersTable({ teamId }: MembersTableProps) {
  const queryClient = useQueryClient();
  const tableParams = useTableParams('name', ColumnSortingDirection.ASC);
  const [removeMemberId, setRemoveMemberId] = useState('');
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const getTeamMembersQuery = useGetTeamMembersQuery(teamId, tableParams.pagination);
  const members = getTeamMembersQuery.data?.data || [];
  const memberToRemove = members.find((m) => m.id === removeMemberId);

  function handleRemoveMember(memberId: string) {
    setRemoveMemberId(memberId);
  }

  function handleRemoveMemberModalClose() {
    setRemoveMemberId('');
  }

  function toggleAddMembersModal() {
    setShowAddMembersModal((prev) => !prev);
  }

  function handleAddMembersSuccess() {
    setShowAddMembersModal(false);
    queryClient.invalidateQueries({
      queryKey: [getTeamMembersQueryKey, teamId, tableParams.pagination],
    });
  }

  function handleRemoveMemberSuccess() {
    setRemoveMemberId('');
    queryClient.invalidateQueries({
      queryKey: [getTeamMembersQueryKey, teamId, tableParams.pagination],
    });
  }

  return (
    <>
      <TableContainer title="Members">
        <TableToolbar>
          <TableToolbarContent>
            <Button type="button" renderIcon={Add} onClick={toggleAddMembersModal}>
              Add members
            </Button>
          </TableToolbarContent>
        </TableToolbar>
        <DataTable rows={members} headers={headers} size="xl">
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {getTeamMembersQuery.fetchStatus === 'fetching' ? (
                  <SkeletonTable rowCount={10} columnCount={headers.length + 1} />
                ) : (
                  rows.map((row) => {
                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                        <ActionTableCell
                          key={`${row.id}-actions`}
                          rowId={row.id}
                          items={[
                            {
                              label: 'Remove member',
                              isDelete: true,
                              icon: Delete,
                              onClick: () => handleRemoveMember(row.id),
                            },
                          ]}
                        />
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </DataTable>
        {getTeamMembersQuery.isSuccess && !members.length ? (
          <EmptyState
            icon={User}
            title="There are no members assigned to this team yet"
            body="Get started by adding members."
          />
        ) : null}
      </TableContainer>
      {showAddMembersModal && (
        <AddMembersModal open onClose={toggleAddMembersModal} teamId={teamId} onSuccess={handleAddMembersSuccess} />
      )}
      {memberToRemove && (
        <RemoveMemberModal
          open
          onClose={handleRemoveMemberModalClose}
          member={memberToRemove}
          teamId={teamId}
          onSuccess={handleRemoveMemberSuccess}
        />
      )}
    </>
  );
}

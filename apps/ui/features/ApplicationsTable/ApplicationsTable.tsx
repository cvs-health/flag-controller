// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import Link from 'next/link';
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
import { Add, Delete } from '@carbon/icons-react';
import { ContainerizedApplications, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import { listById } from 'shared-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { GetApplicationsApplication } from '../../api/requests/getApplications';
import useGetApplicationsQuery, { getApplicationsQueryKey } from '../../api/queries/useGetApplicationsQuery';
import useTableParams from '../../hooks/useTableParams';
import { ActionTableCell } from '../../components/ActionTableCell/ActionTableCell';
import { CreateApplicationModal } from '../CreateApplicationModal/CreateApplicationModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { RemoveApplicationModal } from '../RemoveApplicationModal/RemoveApplicationModal';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

export function ApplicationsTable() {
  const router = useRouter();
  const tableParams = useTableParams();
  const queryClient = useQueryClient();
  const getApplicationsQuery = useGetApplicationsQuery(tableParams.pagination, tableParams.scope);
  const [showCreateApplicationModal, setShowCreateApplicationModal] = useState(false);
  const [applicationToRemove, setApplicationToRemove] = useState<GetApplicationsApplication | null>(null);
  const rows =
    getApplicationsQuery.data?.data.map((application) => ({
      id: application.id,
      application: <Link href={`/applications/${application.name}`}>{application.name}</Link>,
      team: <Link href={`/teams/${application.team.name}`}>{application.team.name}</Link>,
    })) || [];
  const applicationsById = listById(getApplicationsQuery.data?.data || []);
  const headers = [
    {
      header: 'Application',
      key: 'application',
    },
    {
      header: 'Team',
      key: 'team',
    },
  ];

  function toggleCreateApplicationModal() {
    setShowCreateApplicationModal(!showCreateApplicationModal);
  }

  function toggleRemoveApplicationModal() {
    setApplicationToRemove(null);
  }

  function handleRemoveApplication(rowId: string) {
    const application = applicationsById[rowId];

    if (application) {
      setApplicationToRemove(application);
    }
  }

  function handleCreateApplicationSuccess(applicationName: string) {
    router.push(`/applications/${applicationName}`);
  }

  function handleRemoveApplicationSuccess() {
    setApplicationToRemove(null);
    queryClient.invalidateQueries({
      queryKey: [getApplicationsQueryKey, tableParams.pagination, tableParams.scope],
    });
  }

  return (
    <>
      <TableContainer title="Your applications">
        <TableToolbar>
          <TableToolbarContent>
            <Button type="button" renderIcon={Add} onClick={toggleCreateApplicationModal}>
              Create application
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
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {getApplicationsQuery.fetchStatus === 'fetching' ? (
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
                            label: 'Remove application',
                            icon: Delete,
                            onClick: handleRemoveApplication,
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
        {getApplicationsQuery.isError && (
          <EmptyState
            icon={FaceVeryDissatisfied}
            title="Something's wrong"
            body="We were unable to connect to the service. Please try again later."
          />
        )}
        {getApplicationsQuery.isSuccess && !getApplicationsQuery.data?.data.length && !tableParams.search ? (
          <EmptyState
            icon={ContainerizedApplications}
            title="There are no applications assigned to you yet"
            body="Add a new application to start creating flags. Note that you must have a team before you can add an application."
          />
        ) : null}
        <Pagination
          onChange={tableParams.updatePagination}
          page={tableParams.pagination.page}
          pageSize={tableParams.pagination.rows}
          pageSizes={[10, 20, 50]}
          totalItems={getApplicationsQuery.data?.metadata.totalRecords}
        />
      </TableContainer>
      {showCreateApplicationModal && (
        <CreateApplicationModal
          open
          onClose={toggleCreateApplicationModal}
          onSuccess={handleCreateApplicationSuccess}
        />
      )}
      {applicationToRemove && (
        <RemoveApplicationModal
          open
          onClose={toggleRemoveApplicationModal}
          onSuccess={handleRemoveApplicationSuccess}
          applicationId={applicationToRemove.id}
          applicationName={applicationToRemove.name}
        />
      )}
    </>
  );
}

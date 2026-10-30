// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import Link from 'next/link';
import debounce from 'lodash.debounce';
import type { ApplicationsTableColumns } from 'shared-types';
import { Add, Delete } from '@carbon/icons-react';
import { ContainerizedApplications, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import { type ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  TableToolbarSearch,
} from '../../components/Carbon';
import useGetTeamApplicationsQuery from '../../api/queries/useGetTeamApplicationsQuery';
import useTableParams from '../../hooks/useTableParams';
import { ActionTableCell } from '../../components/ActionTableCell/ActionTableCell';
import { CreateApplicationModal } from '../CreateApplicationModal/CreateApplicationModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { RemoveApplicationModal } from '../RemoveApplicationModal/RemoveApplicationModal';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface TeamApplicationsTableProps {
  teamId?: string;
}

export function TeamApplicationsTable({ teamId = '' }: TeamApplicationsTableProps) {
  const router = useRouter();
  const tableParams = useTableParams();
  const [searchApplicationName, setSearchApplicationName] = useState('');
  const getTeamApplicationsQuery = useGetTeamApplicationsQuery(teamId, tableParams.pagination, {
    enabled: !!teamId,
  });
  const [showCreateApplicationModal, setShowCreateApplicationModal] = useState(false);
  const [applicationToRemove, setApplicationToRemove] = useState<ApplicationsTableColumns | null>(null);
  const headers = [
    {
      header: 'Application',
      key: 'application',
    },
  ];
  const rows =
    getTeamApplicationsQuery.data?.data.map((application) => ({
      id: application.id,
      application: <Link href={`/applications/${application.name}`}>{application.name}</Link>,
    })) || [];
  const debounceSearchApplicationName = useMemo(() => debounce(setSearchApplicationName, 500), []);
  const [filteredRows, totalFilteredItems] = useMemo(() => {
    const filtered = searchApplicationName
      ? rows.filter((application) => application.id.toLowerCase().includes(searchApplicationName.toLowerCase()))
      : rows;

    const startIndex = (tableParams.pagination.page - 1) * tableParams.pagination.rows;
    const endIndex = startIndex + tableParams.pagination.rows;

    return [filtered.slice(startIndex, endIndex), filtered.length];
  }, [searchApplicationName, rows, tableParams.pagination]);
  const noResults = !totalFilteredItems && searchApplicationName;

  function handleSearchChange(event: string | ChangeEvent<HTMLInputElement>) {
    debounceSearchApplicationName((event as ChangeEvent<HTMLInputElement>).target.value);
  }

  function toggleCreateApplicationModal() {
    setShowCreateApplicationModal(!showCreateApplicationModal);
  }

  function toggleRemoveApplicationModal() {
    setApplicationToRemove(null);
  }

  function handleRemoveApplication(rowId: string) {
    const application = getTeamApplicationsQuery.data?.data.find((application) => application.id === rowId);

    if (application) {
      setApplicationToRemove(application);
    }
  }

  function handleCreateApplicationSuccess(applicationName: string) {
    router.push(`/applications/${applicationName}`);
  }

  return (
    <>
      <TableContainer title="Team applications">
        <TableToolbar>
          <TableToolbarContent>
            <TableToolbarSearch
              persistent
              labelText="search"
              size="lg"
              onChange={handleSearchChange}
              id="team-applications-table-search"
              placeholder="Search by application name"
              defaultValue={searchApplicationName}
            />
            <Button type="button" renderIcon={Add} onClick={toggleCreateApplicationModal}>
              Create application
            </Button>
          </TableToolbarContent>
        </TableToolbar>
        <DataTable rows={filteredRows} headers={headers} size="xl">
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
                {getTeamApplicationsQuery.isPending ? (
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
        {getTeamApplicationsQuery.isError && (
          <EmptyState
            icon={FaceVeryDissatisfied}
            title="Something's wrong"
            body="We were unable to connect to the service. Please try again later."
          />
        )}
        {noResults ? (
          <EmptyState
            icon={DesignResearch}
            title="No results found"
            body="Try adjusting your search to find what you're looking for."
          />
        ) : null}
        {getTeamApplicationsQuery.isSuccess && !rows.length && !searchApplicationName ? (
          <EmptyState
            icon={ContainerizedApplications}
            title="There are no applications assigned to this team yet"
            body="Create a new application to start creating flags."
          />
        ) : null}
        <Pagination
          onChange={tableParams.updatePagination}
          page={tableParams.pagination.page}
          pageSize={tableParams.pagination.rows}
          pageSizes={[10, 20, 50]}
          totalItems={searchApplicationName ? totalFilteredItems : rows.length}
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
          onSuccess={toggleRemoveApplicationModal}
          applicationId={applicationToRemove.id}
          applicationName={applicationToRemove.name}
        />
      )}
    </>
  );
}

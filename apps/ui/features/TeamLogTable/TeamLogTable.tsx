// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AssessmentUsed, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';

import useGetTeamAuditLogQuery from '../../api/queries/useGetTeamAuditLogQuery';
import {
  DataTable,
  type DataTableSortState,
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
import parseAuditLogResponse from '../../utils/parseAuditLogResponse';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { LOG_TABLE_COLUMNS } from '../../constants/logs';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface TeamLogTableProps {
  teamId?: string;
}

function TeamLogTable({ teamId = '' }: TeamLogTableProps) {
  const tableParams = useTableParams('createdAt');
  const getTeamAuditLogQuery = useGetTeamAuditLogQuery(
    teamId,
    tableParams.search,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
    { enabled: !!teamId },
  );
  const noResults = !!(getTeamAuditLogQuery.isSuccess && !getTeamAuditLogQuery.data?.data.length && tableParams.search);
  const log = parseAuditLogResponse(getTeamAuditLogQuery.data?.data);
  const sortableHeaders = ['action', 'environmentKey', 'createdAt'];
  const rows = getTeamAuditLogQuery.isError ? [] : log;

  return (
    <TableContainer title="Team log">
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            defaultValue={tableParams.search}
            id="team-log-table-search"
            labelText="search"
            onChange={tableParams.updateSearch}
            persistent
            placeholder="Search by key or actor"
            size="lg"
          />
        </TableToolbarContent>
      </TableToolbar>
      <DataTable rows={rows} headers={LOG_TABLE_COLUMNS} size="xl">
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    {...getHeaderProps({ header, isSortable: sortableHeaders.includes(header.key) })}
                    onClick={() => tableParams.updateSort(header.key)}
                    sortDirection={tableParams.columnSorting.direction.toUpperCase() as DataTableSortState}
                    isSortHeader={tableParams.columnSorting.column === header.key}
                    key={header.key}
                  >
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {getTeamAuditLogQuery.fetchStatus === 'fetching' ? (
                <SkeletonTable rowCount={tableParams.pagination.rows} columnCount={headers.length} />
              ) : (
                rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {getTeamAuditLogQuery.isError && (
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
      {getTeamAuditLogQuery.isSuccess && !getTeamAuditLogQuery.data?.data.length && !tableParams.search ? (
        <EmptyState
          icon={AssessmentUsed}
          title="No logs exist yet"
          body="Log entries will exist when anything a team owns is updated."
        />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getTeamAuditLogQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

export default TeamLogTable;

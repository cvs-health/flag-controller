// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AssessmentUsed, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import { Scope } from 'shared-types';

import useGetAuditLogQuery from '../../api/queries/useGetAuditLogQuery';
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
import parseLogFiltersSearchParams from '../../utils/parseLogFiltersSearchParams';
import styles from './LogTable.module.scss';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { LOG_TABLE_COLUMNS } from '../../constants/logs';
import { LogFilters } from '../../components/LogFilters/LogFilters';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

export function LogTable() {
  const tableParams = useTableParams('createdAt');
  const initialFilters = parseLogFiltersSearchParams(tableParams.filters);
  const getAuditLogQuery = useGetAuditLogQuery(
    tableParams.search,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
    tableParams.filters,
    tableParams.scope,
  );
  const noResults = !!(
    getAuditLogQuery.isSuccess &&
    !getAuditLogQuery.data?.data.length &&
    (tableParams.search || tableParams.filters)
  );
  const log = parseAuditLogResponse(getAuditLogQuery.data?.data);
  const sortableHeaders = ['action', 'applicationName', 'environmentKey', 'actorEmail', 'createdAt'];
  const rows = getAuditLogQuery.isError ? [] : log;
  const title = tableParams.scope === Scope.Me ? 'Your logs' : 'All logs';

  return (
    <TableContainer title={title} className={styles.root}>
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            defaultValue={tableParams.search}
            id="log-table-search"
            labelText="search"
            onChange={tableParams.updateSearch}
            placeholder="Search by application, key, or actor"
            size="lg"
          />
          <LogFilters onApplyFilters={tableParams.updateFilters} initialFilters={initialFilters} />
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
              {getAuditLogQuery.fetchStatus === 'fetching' ? (
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
      {getAuditLogQuery.isError && (
        <EmptyState
          icon={FaceVeryDissatisfied}
          title="Something's wrong"
          body="We were unable to connect to the service. Please try again later."
        />
      )}
      {getAuditLogQuery.isSuccess &&
      !getAuditLogQuery.data?.data.length &&
      !(tableParams.search || tableParams.filters) ? (
        <EmptyState
          icon={AssessmentUsed}
          title="No logs exist yet"
          body="Log entries will exist when a flag or segment is created"
        />
      ) : null}
      {noResults ? (
        <EmptyState
          icon={DesignResearch}
          title="No results found"
          body="Try adjusting your search to find what you're looking for."
        />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getAuditLogQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

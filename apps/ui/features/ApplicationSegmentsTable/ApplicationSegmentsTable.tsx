// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AnalyzesData, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import {
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
  type DataTableSortState,
} from '@carbon/react';

import segmentsTableData from '../../utils/segmentsTableData';
import useGetApplicationSegmentsQuery from '../../api/queries/useGetApplicationSegmentsQuery';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface ApplicationSegmentsTableProps {
  applicationId: string;
}

export function ApplicationSegmentsTable({ applicationId }: ApplicationSegmentsTableProps) {
  const tableParams = useTableParams('updatedAt');
  const getApplicationSegmentsQuery = useGetApplicationSegmentsQuery(
    applicationId,
    tableParams.search,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
  );
  const noResults =
    getApplicationSegmentsQuery.isSuccess && !getApplicationSegmentsQuery.data?.data.length && tableParams.search;
  const reducedSegmentsByIdentifier = segmentsTableData(getApplicationSegmentsQuery.data?.data);
  const sortableHeaders = ['key', 'updatedAt'];
  const rows = getApplicationSegmentsQuery.isError ? [] : Object.values(reducedSegmentsByIdentifier);
  const headers = [
    {
      header: 'Segment',
      key: 'key',
    },
    {
      header: 'Last modified',
      key: 'updatedAt',
    },
    {
      header: 'Flags targeting',
      key: 'flagTargetCount',
    },
  ];

  return (
    <TableContainer title="Application segments">
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            persistent
            labelText="search"
            size="lg"
            onChange={tableParams.updateSearch}
            id="application-segments-table-search"
            placeholder="Search by segment name"
            defaultValue={tableParams.search}
          />
        </TableToolbarContent>
      </TableToolbar>
      <DataTable rows={rows} headers={headers} size="xl">
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
              {getApplicationSegmentsQuery.fetchStatus === 'fetching' ? (
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
      {getApplicationSegmentsQuery.isError && (
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
      {getApplicationSegmentsQuery.isSuccess &&
      !getApplicationSegmentsQuery.data?.data.length &&
      !tableParams.search ? (
        <EmptyState
          icon={AnalyzesData}
          title="Start by adding a segment"
          body="To create a segment, click Create segment."
        />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getApplicationSegmentsQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

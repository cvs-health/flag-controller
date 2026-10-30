// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AnalyzesData, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import type { ReactNode } from 'react';

import useGetSegmentsQuery from '../../api/queries/useGetSegmentsQuery';
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
import segmentsTableData from '../../utils/segmentsTableData';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface SegmentsTableProps {
  children?: ReactNode;
}

export function SegmentsTable({ children = null }: SegmentsTableProps) {
  const tableParams = useTableParams('updatedAt');
  const getSegmentsQuery = useGetSegmentsQuery(
    tableParams.search,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
  );
  const reducedSegmentsByIdentifier = segmentsTableData(getSegmentsQuery.data?.data);
  const sortableHeaders = ['key', 'applicationName', 'updatedAt'];
  const rows = getSegmentsQuery.isError ? [] : Object.values(reducedSegmentsByIdentifier);
  const headers = [
    {
      header: 'Segment',
      key: 'key',
    },
    {
      header: 'Application',
      key: 'applicationName',
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
    <TableContainer
      title="All segments"
      description="Segments shown by default are related to you based on your applications. Use the search input to search across all applications."
    >
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            defaultValue={tableParams.search}
            id="segments-table-search"
            labelText="search"
            onChange={tableParams.updateSearch}
            persistent
            placeholder="Search by segment name"
            size="lg"
          />
          {children}
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
              {getSegmentsQuery.fetchStatus === 'fetching' ? (
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
      {getSegmentsQuery.isError && (
        <EmptyState
          icon={FaceVeryDissatisfied}
          title="Something's wrong"
          body="We were unable to connect to the service. Please try again later."
        />
      )}
      {getSegmentsQuery.isSuccess && !getSegmentsQuery.data?.data.length && tableParams.search ? (
        <EmptyState
          icon={DesignResearch}
          title="No results found"
          body="Try adjusting your search to find what you're looking for."
        />
      ) : null}
      {getSegmentsQuery.isSuccess && !getSegmentsQuery.data?.data.length && !tableParams.search ? (
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
        totalItems={getSegmentsQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

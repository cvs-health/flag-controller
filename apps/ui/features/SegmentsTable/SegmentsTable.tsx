// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AnalyzesData, DesignResearch, FaceVeryDissatisfied } from '@carbon/pictograms-react';
import type { ReactNode } from 'react';
import { Scope } from 'shared-types';
import { useSearchParams } from 'next/navigation';

import useGetSegmentsQuery from '../../api/queries/useGetSegmentsQuery';
import {
  DataTable,
  type DataTableSortState,
  Link,
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
import updateSearchParams from '../../utils/updateSearchParams';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface SegmentsTableProps {
  children?: ReactNode;
}

export function SegmentsTable({ children = null }: SegmentsTableProps) {
  const searchParams = useSearchParams();
  const tableParams = useTableParams('updatedAt');
  const getSegmentsQuery = useGetSegmentsQuery(
    tableParams.search,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
    tableParams.scope
  );
  const searchPlaceholder = tableParams.scope === Scope.All ? 'Search segments across the organization\'s applications by segment name' : 'Search segments from your teams\' applications by segment name';
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
  const noResults = !!(
    getSegmentsQuery.isSuccess &&
    !getSegmentsQuery.data?.data.length &&
    (tableParams.search || tableParams.filters)
  );
  const noLogsFoundCopy =
    tableParams.scope === Scope.Me ? (
      <>
        Search <Link href={`/segments?${updateSearchParams(searchParams, [['scope', Scope.All]])}`}>All segments</Link> instead
      </>
    ) : (
      'Try adjusting your search to find what you\'re looking for.'
    );


  return (
    <TableContainer>
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            defaultValue={tableParams.search}
            id="segments-table-search"
            labelText="search"
            onChange={tableParams.updateSearch}
            persistent
            placeholder={searchPlaceholder}
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
      {noResults ? (
        <EmptyState
          icon={DesignResearch}
          title="No segments found"
          body={noLogsFoundCopy}
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

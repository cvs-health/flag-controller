// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

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
} from '@carbon/react';
import { DesignResearch, FaceVeryDissatisfied, Flag } from '@carbon/pictograms-react';

import useGetApplicationFeatureFlagsQuery from '../../api/queries/useGetApplicationFeatureFlagsQuery';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';
import featureFlagsTableData from '../../utils/featureFlagsTableData';

interface ApplicationFeatureFlagsTableProps {
  applicationId: string;
}

export function ApplicationFeatureFlagsTable({ applicationId }: ApplicationFeatureFlagsTableProps) {
  const tableParams = useTableParams('key');
  const getApplicationFeatureFlagsQuery = useGetApplicationFeatureFlagsQuery(
    applicationId,
    tableParams.search,
    tableParams.pagination,
    true,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
  );
  const noResults = !!(
    getApplicationFeatureFlagsQuery.isSuccess &&
    !getApplicationFeatureFlagsQuery.data?.data.length &&
    tableParams.search
  );
  const reducedFlagsByIdentifier = featureFlagsTableData(getApplicationFeatureFlagsQuery.data?.data);
  const sortableHeaders = ['key', 'createdAt', 'updatedAt', 'type'];
  const rows = getApplicationFeatureFlagsQuery.isError ? [] : Object.values(reducedFlagsByIdentifier);
  const headers = [
    {
      header: 'Flag',
      key: 'key',
    },
    {
      header: 'Created',
      key: 'createdAt',
    },
    {
      header: 'Last Modified',
      key: 'updatedAt',
    },
    {
      header: 'Type',
      key: 'type',
    },
    {
      header: 'Enabled',
      key: 'enabled',
    },
  ];

  return (
    <TableContainer title="Application flags">
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            persistent
            labelText="search"
            size="lg"
            onChange={tableParams.updateSearch}
            id="application-feature-flags-table-search"
            placeholder="Search by flag name"
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
              {getApplicationFeatureFlagsQuery.fetchStatus === 'fetching' ? (
                <SkeletonTable rowCount={10} columnCount={headers.length} />
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
      {getApplicationFeatureFlagsQuery.isError && (
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
      {getApplicationFeatureFlagsQuery.isSuccess &&
      !getApplicationFeatureFlagsQuery.data?.data.length &&
      !tableParams.search ? (
        <EmptyState icon={Flag} title="Start by adding a flag" body="To create a feature flag, click Create > Flag." />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getApplicationFeatureFlagsQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

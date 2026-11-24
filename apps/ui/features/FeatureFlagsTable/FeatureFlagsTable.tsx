// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { DesignResearch, FaceVeryDissatisfied, Flag } from '@carbon/pictograms-react';
import { useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { Scope } from 'shared-types';
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
} from '@carbon/react';

import featureFlagsTableData from '../../utils/featureFlagsTableData';
import parseFlagsFiltersSearchParams from '../../utils/parseFlagsFiltersSearchParams';
import updateSearchParams from '../../utils/updateSearchParams';
import useGetFeatureFlagsQuery, { getFeatureFlagsQueryKey } from '../../api/queries/useGetFeatureFlagsQuery';
import useTableParams from '../../hooks/useTableParams';
import { ColumnSortingDirection } from '../../typings/api';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { FeatureFlagsFilters } from '../../components/FeatureFlagsFilters/FeatureFlagsFilters';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';
import { flagsScopeLabels } from '../../constants/common';

interface FeatureFlagsTableProps {
  children?: ReactNode;
}

const searchPlaceholders = {
  [Scope.Me]: "Search flags from your teams' applications by flag and/or application",
  [Scope.All]: "Search flags across the organization's applications by flag and/or application",
};

export function FeatureFlagsTable({ children = null }: FeatureFlagsTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tableParams = useTableParams('key', ColumnSortingDirection.ASC);
  const initialFilters = parseFlagsFiltersSearchParams(tableParams.filters);
  const getFeatureFlagsQuery = useGetFeatureFlagsQuery(
    tableParams.search,
    tableParams.pagination,
    true,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
    tableParams.filters,
    tableParams.scope,
  );

  function handleArchived() {
    void queryClient.invalidateQueries({ queryKey: [getFeatureFlagsQueryKey] });
  }

  const noResults = !!(
    getFeatureFlagsQuery.isSuccess &&
    !getFeatureFlagsQuery.data?.data.length &&
    (tableParams.search || tableParams.filters)
  );
  const allFlagsSearchParams = updateSearchParams(searchParams, [
    ['scope', Scope.All],
    ['page', '1'],
  ]);
  const reducedFlagsByIdentifier = featureFlagsTableData(getFeatureFlagsQuery.data?.data, {
    includeActions: true,
    onArchived: handleArchived,
  });
  const sortableHeaders = ['key', 'applicationName', 'createdAt', 'updatedAt', 'type'];
  const rows = getFeatureFlagsQuery.isError ? [] : Object.values(reducedFlagsByIdentifier);
  const headers = [
    {
      header: 'Flag',
      key: 'key',
    },
    {
      header: 'Application',
      key: 'applicationName',
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
    {
      header: 'Action',
      key: 'action',
    },
  ];

  return (
    <TableContainer>
      <TableToolbar>
        <TableToolbarContent>
          <TableToolbarSearch
            defaultValue={tableParams.search}
            id="feature-flags-table-search"
            labelText="search"
            onChange={tableParams.updateSearch}
            persistent
            placeholder={searchPlaceholders[tableParams.scope]}
            size="lg"
          />
          <FeatureFlagsFilters onApplyFilters={tableParams.updateFilters} initialFilters={initialFilters} />
          {children}
        </TableToolbarContent>
      </TableToolbar>
      <DataTable rows={rows} headers={headers} size="xl">
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()} aria-label={flagsScopeLabels[tableParams.scope]}>
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
              {getFeatureFlagsQuery.fetchStatus === 'fetching' ? (
                <SkeletonTable rowCount={10} columnCount={headers.length} />
              ) : (
                rows.map((row) => {
                  return (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {getFeatureFlagsQuery.isError && (
        <EmptyState
          icon={FaceVeryDissatisfied}
          title="Something's wrong"
          body="We were unable to connect to the service. Please try again later."
        />
      )}
      {noResults ? (
        <EmptyState
          icon={DesignResearch}
          title="No flags found"
          body={
            tableParams.scope === Scope.Me ? (
              <>
                Search{' '}
                <Link as={NextLink} href={`${pathname}?${allFlagsSearchParams}`} inline>
                  {flagsScopeLabels[Scope.All]}
                </Link>{' '}
                instead
              </>
            ) : (
              "Try adjusting your search to find what you're looking for."
            )
          }
        />
      ) : null}
      {getFeatureFlagsQuery.isSuccess &&
      !getFeatureFlagsQuery.data?.data.length &&
      !(tableParams.search || tableParams.filters) ? (
        <EmptyState icon={Flag} title="Start by adding a flag" body="To create a feature flag, click Create flag." />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getFeatureFlagsQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

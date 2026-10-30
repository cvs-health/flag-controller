// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { AssessmentUsed, FaceVeryDissatisfied } from '@carbon/pictograms-react';
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
} from '@carbon/react';

import parseAuditLogResponse from '../../utils/parseAuditLogResponse';
import useGetSegmentAuditLogQuery from '../../api/queries/useGetSegmentAuditLogQuery';
import useTableParams from '../../hooks/useTableParams';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { LOG_TABLE_COLUMNS } from '../../constants/logs';
import { SkeletonTable } from '../../components/SkeletonTable/SkeletonTable';

interface SegmentLogTableProps {
  segmentId: string;
}

export function SegmentLogTable({ segmentId }: SegmentLogTableProps) {
  const tableParams = useTableParams('createdAt');
  const getSegmentAuditLogQuery = useGetSegmentAuditLogQuery(
    segmentId,
    tableParams.pagination,
    `${tableParams.columnSorting.column}:${tableParams.columnSorting.direction}`,
  );
  const log = parseAuditLogResponse(getSegmentAuditLogQuery.data?.data);
  const sortableHeaders = ['action', 'environmentKey', 'createdAt'];
  const rows = getSegmentAuditLogQuery.isError ? [] : log;

  return (
    <TableContainer title="Segment log">
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
              {getSegmentAuditLogQuery.fetchStatus === 'fetching' ? (
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
      {getSegmentAuditLogQuery.isError && (
        <EmptyState
          icon={FaceVeryDissatisfied}
          title="Something's wrong"
          body="We were unable to connect to the service. Please try again later."
        />
      )}
      {getSegmentAuditLogQuery.isSuccess && !getSegmentAuditLogQuery.data?.data.length ? (
        <EmptyState
          icon={AssessmentUsed}
          title="No logs exist yet"
          body="Log entries will exist when a segment or its rule is changed."
        />
      ) : null}
      <Pagination
        onChange={tableParams.updatePagination}
        page={tableParams.pagination.page}
        pageSize={tableParams.pagination.rows}
        pageSizes={[10, 20, 50]}
        totalItems={getSegmentAuditLogQuery.data?.metadata.totalRecords}
      />
    </TableContainer>
  );
}

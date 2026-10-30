// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { SkeletonText, TableCell, TableRow } from '@carbon/react';

interface SkeletonTableProps {
  columnCount?: number;
  rowCount?: number;
}

export function SkeletonTable({ rowCount = 5, columnCount = 5 }: SkeletonTableProps) {
  return Array.from(Array(rowCount).keys()).map((row) => (
    <TableRow key={row}>
      {Array.from(Array(columnCount).keys()).map((column) => (
        <TableCell key={column}>
          <SkeletonText />
        </TableCell>
      ))}
    </TableRow>
  ));
}

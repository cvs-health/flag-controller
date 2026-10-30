// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { OverflowMenu, OverflowMenuItem, type OverflowMenuItemProps, TableCell } from '@carbon/react';
import type { CarbonIconType } from '@carbon/icons-react';

import styles from './ActionTableCell.module.scss';

interface ActionTableCellItem extends Omit<OverflowMenuItemProps, 'onClick'> {
  icon?: CarbonIconType;
  label: string;
  onClick?: (rowId: string) => void;
}

interface ActionTableCellProps {
  rowId: string;
  items: ActionTableCellItem[];
}

export function ActionTableCell({ rowId, items }: ActionTableCellProps) {
  function handleMenuItemClick(onClick: ActionTableCellItem['onClick']) {
    if (onClick) {
      return () => onClick(rowId);
    }
  }

  return (
    <TableCell>
      <OverflowMenu aria-label="Actions" size="md" autoAlign>
        {items.map(({ icon: Icon, label, ...rest }) => (
          <OverflowMenuItem
            {...rest}
            onClick={handleMenuItemClick(rest.onClick)}
            key={`${rowId}-action-${label}`}
            itemText={
              Icon ? (
                <span className={styles.menuItem}>
                  {label}
                  <Icon size={16} aria-label={label} />
                </span>
              ) : (
                label
              )
            }
          />
        ))}
      </OverflowMenu>
    </TableCell>
  );
}

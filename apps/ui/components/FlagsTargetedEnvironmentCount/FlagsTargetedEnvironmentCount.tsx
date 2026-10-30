// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Stack, Tag } from '../Carbon';
import styles from './FlagsTargetedEnvironmentCount.module.scss';

interface FlagsTargetedEnvironmentCountProps {
  count: number;
  environment?: string;
}

/**
 * Used to display the count of flags targeted to a specific environment.
 */
export function FlagsTargetedEnvironmentCount({ count, environment }: FlagsTargetedEnvironmentCountProps) {
  return (
    <Stack orientation="horizontal" className={styles.root} gap={3}>
      <Tag size="sm" title="Flags targeted count" type="high-contrast">
        {count}
      </Tag>
      {environment ? <span className={styles.environment}>{environment}</span> : null}
    </Stack>
  );
}

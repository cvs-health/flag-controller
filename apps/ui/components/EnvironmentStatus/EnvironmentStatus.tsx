// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { gray50, green50 } from '@carbon/colors';
import { CheckmarkFilled, CircleSolid } from '@carbon/icons-react';

import { Stack } from '../Carbon';
import styles from './EnvironmentStatus.module.scss';

interface EnvironmentStatusProps {
  enabled: boolean;
  environment: string;
}

/**
 * Used to display the status of a feature flag in a specific environment.
 * It shows a green circle if the flag is enabled in that environment, otherwise it shows a grey circle.
 */
export function EnvironmentStatus({ enabled, environment }: EnvironmentStatusProps) {
  return (
    <Stack orientation="horizontal" className={styles.root} gap={3}>
      {enabled ? (
        <CheckmarkFilled size={16} fill={green50} title="checkmark-filled" />
      ) : (
        <CircleSolid size={16} fill={gray50} title="circle-stroke" />
      )}
      <span className={styles.environment}>{environment}</span>
    </Stack>
  );
}

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagEnvironmentsJoined } from 'shared-types';

import styles from './ReadOnlyFeatureFlagEnvironmentActions.module.scss';
import { Labeled } from '../Labeled/Labeled';
import { Stack, Toggle, Tooltip } from '../Carbon';
import { environmentLabels } from '../../constants/common';

interface ReadOnlyFeatureFlagEnvironmentActionsProps {
  archived?: boolean;
  environments: FeatureFlagEnvironmentsJoined[];
}

export function ReadOnlyFeatureFlagEnvironmentActions({
  archived = false,
  environments = [],
}: ReadOnlyFeatureFlagEnvironmentActionsProps) {
  function renderToggle(environment: FeatureFlagEnvironmentsJoined) {
    const toggle = (
      <Toggle
        key={environment.environmentKey}
        id={environment.environmentId}
        labelText={environmentLabels[environment.environmentKey]}
        readOnly
        toggled={environment.enabled}
      />
    );

    if (!archived) {
      return toggle;
    }

    return (
      <Tooltip key={environment.environmentKey} align="bottom" label="Restore this flag before toggling environments">
        <div>{toggle}</div>
      </Tooltip>
    );
  }

  return (
    <Stack gap={5} className={styles.root}>
      <Labeled label="Environment toggles">
        <p className={styles.description}>Status of the flag for a specific environment</p>
      </Labeled>
      <Stack gap={6} orientation="horizontal" className={styles.toggles}>
        {environments.map(renderToggle)}
      </Stack>
    </Stack>
  );
}

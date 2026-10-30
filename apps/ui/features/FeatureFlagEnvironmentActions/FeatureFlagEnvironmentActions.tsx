// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Stack, Toggle } from '@carbon/react';
import type { FeatureFlagEnvironmentsJoined } from 'shared-types';

import styles from './FeatureFlagEnvironmentActions.module.scss';
import usePatchFeatureFlagEnvironmentMutation from '../../api/mutations/usePatchFeatureFlagEnvironmentMutation';
import { Labeled } from '../../components/Labeled/Labeled';
import { environmentLabels } from '../../constants/common';

interface FeatureFlagEnvironmentActionsProps {
  environments?: FeatureFlagEnvironmentsJoined[];
}

export function FeatureFlagEnvironmentActions({ environments = [] }: FeatureFlagEnvironmentActionsProps) {
  const patchFeatureFlagEnvironmentMutation = usePatchFeatureFlagEnvironmentMutation();

  function handleToggle(enabled: boolean, environmentId: string, flagId: string) {
    patchFeatureFlagEnvironmentMutation.mutate({
      environmentId,
      featureFlagId: flagId,
      body: {
        enabled,
      },
    });
  }

  return (
    <Stack gap={5} className={styles.root}>
      <Labeled label="Environment toggles">
        <p className={styles.description}>Status of the flag for a specific environment</p>
      </Labeled>
      <div>
        <Stack gap={6} orientation="horizontal" className={styles.toggles}>
          {environments.map((environment) => (
            <Toggle
              key={environment.environmentKey}
              id={environment.environmentId}
              labelText={environmentLabels[environment.environmentKey]}
              onToggle={(enabled) => handleToggle(enabled, environment.environmentId, environment.flagId)}
              defaultToggled={environment.enabled}
            />
          ))}
        </Stack>
        <p className={styles.error}>{patchFeatureFlagEnvironmentMutation.isError ? 'Error saving changes' : ''}</p>
      </div>
    </Stack>
  );
}

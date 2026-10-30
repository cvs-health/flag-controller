// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Link, Stack } from '@carbon/react';

import { ActionType } from 'shared-types';
import { ActionTag } from '../components/ActionTag/ActionTag';
import { EnvironmentStatus } from '../components/EnvironmentStatus/EnvironmentStatus';
import { FeatureFlagTypeTag } from '../components/FeatureFlagTypeTag/FeatureFlagTypeTag';
import type { FeatureFlagListItem } from '../typings/flags';
import formatDateTime from './formatDateTime';

function featureFlagsTableData(featureFlags: FeatureFlagListItem[] = []) {
  return featureFlags.map((flag) => {
    const id = `${flag.applicationName}/${flag.key}`;
    const enabledByEnvironment = Object.entries(flag.enabled)
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([environmentKey, enabled]) => ({ environmentKey, enabled }));

    return {
      applicationName: <Link href={`/applications/${flag.applicationName}`}>{flag.applicationName}</Link>,
      createdAt: formatDateTime(flag.createdAt),
      enabled: (
        <Stack orientation="vertical" gap={1}>
          {enabledByEnvironment.map((item) => (
            <EnvironmentStatus enabled={item.enabled} environment={item.environmentKey} key={item.environmentKey} />
          ))}
        </Stack>
      ),
      id,
      key: (
        <Stack orientation="vertical" gap={2}>
          <Link href={`/applications/${flag.applicationName}/flags/${flag.key}`}>{flag.key}</Link>
          {flag.archived && (
            <div>
              <ActionTag action={ActionType.Archive} />
            </div>
          )}
        </Stack>
      ),
      updatedAt: formatDateTime(flag.updatedAt),
      type: <FeatureFlagTypeTag type={flag.type} />,
    };
  }, {});
}

export default featureFlagsTableData;

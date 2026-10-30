// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagEnvironmentsJoined, FeatureFlagType } from 'shared-types';
import Link from 'next/link';

import styles from './FeatureFlagDetails.module.scss';
import { FeatureFlagActionsMenu } from '../FeatureFlagActionsMenu/FeatureFlagActionsMenu';
import { FeatureFlagDescription } from '../FeatureFlagDescription/FeatureFlagDescription';
import { FeatureFlagEnvironmentActions } from '../FeatureFlagEnvironmentActions/FeatureFlagEnvironmentActions';
import { Heading, Stack } from '../../components/Carbon';
import { Labeled, LabeledLabelSize } from '../../components/Labeled/Labeled';
import { ReadOnlyFeatureFlagEnvironmentActions } from '../../components/ReadOnlyFeatureFlagEnvironmentActions/ReadOnlyFeatureFlagEnvironmentActions';
import { featureFlagTypeLabels } from '../../constants/common';

interface FeatureFlagDetailsProps {
  applicationId?: string;
  applicationName?: string;
  archived?: boolean;
  description?: string;
  environments?: FeatureFlagEnvironmentsJoined[];
  featureFlagId: string;
  featureFlagKey?: string;
  featureFlagType?: FeatureFlagType;
  teamName?: string;
}

export function FeatureFlagDetails({
  applicationId = '',
  applicationName = '-',
  archived = false,
  description = '',
  environments = [],
  featureFlagId,
  featureFlagKey = '-',
  featureFlagType,
  teamName = '-',
}: FeatureFlagDetailsProps) {
  return (
    <Stack gap={7} className={styles.details}>
      <div className={styles.key}>
        <Labeled
          label={`Flag - ${featureFlagType ? featureFlagTypeLabels[featureFlagType] : ''}`}
          labelSize={LabeledLabelSize.Medium}
        >
          <Heading className={styles.heading}>{featureFlagKey || '-'}</Heading>
        </Labeled>
        {!archived ? (
          <FeatureFlagActionsMenu
            applicationId={applicationId}
            featureFlagId={featureFlagId}
            featureFlagKey={featureFlagKey}
          />
        ) : null}
      </div>
      <Stack orientation="horizontal" gap={7}>
        <Stack gap={8} className={styles.divided}>
          <Labeled label="Team">
            <Link passHref href={`/teams/${teamName}`}>
              {teamName}
            </Link>
          </Labeled>
          <Labeled label="Application">
            <Link passHref href={`/applications/${applicationName}`}>
              {applicationName}
            </Link>
          </Labeled>
        </Stack>
        <FeatureFlagDescription
          className={styles.divided}
          description={description}
          featureFlagId={featureFlagId}
          readOnly={archived}
        />
        {archived ? (
          <ReadOnlyFeatureFlagEnvironmentActions archived environments={environments} />
        ) : (
          <FeatureFlagEnvironmentActions environments={environments} />
        )}
      </Stack>
    </Stack>
  );
}

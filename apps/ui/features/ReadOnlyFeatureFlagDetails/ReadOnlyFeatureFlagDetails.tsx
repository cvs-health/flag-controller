// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagEnvironmentsJoined, FeatureFlagType } from 'shared-types';
import Link from 'next/link';

import styles from './ReadOnlyFeatureFlagDetails.module.scss';
import { FeatureFlagDescription } from '../FeatureFlagDescription/FeatureFlagDescription';
import { Heading, Stack } from '../../components/Carbon';
import { Labeled, LabeledLabelSize } from '../../components/Labeled/Labeled';
import { ReadOnlyFeatureFlagEnvironmentActions } from '../../components/ReadOnlyFeatureFlagEnvironmentActions/ReadOnlyFeatureFlagEnvironmentActions';
import { featureFlagTypeLabels } from '../../constants/common';

interface FeatureFlagDetailsProps {
  applicationName?: string;
  archived?: boolean;
  description?: string;
  environments?: FeatureFlagEnvironmentsJoined[];
  featureFlagKey?: string;
  featureFlagId: string;
  featureFlagType?: FeatureFlagType;
  teamName?: string;
}

export function ReadOnlyFeatureFlagDetails({
  applicationName = '',
  archived = false,
  description = '',
  environments = [],
  featureFlagKey = '',
  featureFlagId,
  featureFlagType,
  teamName = '',
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
          readOnly
        />
        <ReadOnlyFeatureFlagEnvironmentActions archived={archived} environments={environments} />
      </Stack>
    </Stack>
  );
}

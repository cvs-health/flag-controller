// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { FeatureFlagType, type FlagVariationsTableColumns } from 'shared-types';

import styles from './ReadOnlyFeatureFlagVariations.module.scss';
import { CodeSnippet, FormLabel } from '../../components/Carbon';

interface ReadOnlyFeatureFlagVariationsProps {
  featureFlagType?: FeatureFlagType;
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFeatureFlagVariations({ featureFlagType, variations }: ReadOnlyFeatureFlagVariationsProps) {
  const objectType = featureFlagType === FeatureFlagType.Object;

  return variations.map(({ key, value }) => (
    <div key={key} className={styles.variation}>
      <FormLabel>{key}</FormLabel>
      <CodeSnippet type={objectType ? 'multi' : 'inline'}>
        {objectType ? JSON.stringify(value) : value.toString()}
      </CodeSnippet>
    </div>
  ));
}

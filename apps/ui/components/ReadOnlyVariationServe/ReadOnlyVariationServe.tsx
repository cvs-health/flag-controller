// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns } from 'shared-types';

import styles from './ReadOnlyVariationServe.module.scss';
import variationKeyFromId from '../../utils/variationKeyFromId';

interface ReadOnlyVariationServeProps {
  className?: string;
  variationId: string;
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyVariationServe({ className = '', variationId, variations }: ReadOnlyVariationServeProps) {
  return (
    <div className={className}>
      <span className={styles.rolloutLabel}>SERVE</span>
      {` ${variationKeyFromId(variationId, variations) || ''}`}
    </div>
  );
}

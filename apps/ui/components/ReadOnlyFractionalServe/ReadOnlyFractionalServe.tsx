// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns, FractionalsTableColumns } from 'shared-types';

import styles from './ReadOnlyFractionalServe.module.scss';
import variationKeyFromId from '../../utils/variationKeyFromId';

interface ReadOnlyFractionalServeProps {
  className?: string;
  fractional: Pick<FractionalsTableColumns, 'var' | 'weights'>;
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyFractionalServe({ className = '', fractional, variations }: ReadOnlyFractionalServeProps) {
  return (
    <div className={className}>
      <span className={styles.rolloutLabel}>WEIGHTED ROLLOUT</span>
      {`${fractional.var ? ` based on ${fractional.var} -` : ''} ${fractional.weights
        .map(([id, value]) => `${value} ${variationKeyFromId(id, variations)}`)
        .join(', ')}`}
    </div>
  );
}

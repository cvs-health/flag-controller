// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { Tile } from '@carbon/react';
import type { FlagVariationsTableColumns } from 'shared-types';

import styles from './ReadOnlyDefaultRule.module.scss';
import RuleHeadingTile from '../RuleHeadingTile/RuleHeadingTile';
import { ReadOnlyVariationServe } from '../ReadOnlyVariationServe/ReadOnlyVariationServe';

interface ReadOnlyDefaultRuleProps {
  className?: string;
  defaultVariationId: string;
  variations: FlagVariationsTableColumns[];
}

export function ReadOnlyDefaultRule({ className = '', defaultVariationId, variations }: ReadOnlyDefaultRuleProps) {
  return (
    <div className={classNames(styles.root, className)}>
      <RuleHeadingTile label="Default rule key" heading="default rule" />
      <Tile>
        <ReadOnlyVariationServe variationId={defaultVariationId} variations={variations} />
      </Tile>
    </div>
  );
}

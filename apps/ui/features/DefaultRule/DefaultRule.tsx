// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { Button, ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent } from '@carbon/react';
import type { FlagVariationsTableColumns } from 'shared-types';
import { useState } from 'react';

import RuleHeadingTile from '../../components/RuleHeadingTile/RuleHeadingTile';
import styles from './DefaultRule.module.scss';
import { ReadOnlyVariationServe } from '../../components/ReadOnlyVariationServe/ReadOnlyVariationServe';
import { RuleServeSelect } from '../../components/RuleServeSelect/RuleServeSelect';

interface DefaultRuleProps {
  className?: string;
  defaultVariationId: string;
  variations: FlagVariationsTableColumns[];
}

export function DefaultRule({ className = '', defaultVariationId, variations }: DefaultRuleProps) {
  const [expanded, setExpanded] = useState(false);

  function toggleExpanded() {
    setExpanded(!expanded);
  }

  return (
    <div id="default-rule" className={classNames(styles.root, className)}>
      <RuleHeadingTile heading="default rule" label="Default rule key" onEdit={toggleExpanded} />
      <ExpandableTile onClick={toggleExpanded} expanded={expanded}>
        <TileAboveTheFoldContent>
          <div className={styles.above}>
            <ReadOnlyVariationServe variationId={defaultVariationId} variations={variations} />
            {expanded && (
              <Button kind="ghost" size="sm" className={styles.editButton} onClick={toggleExpanded} disabled={false}>
                Cancel edit
              </Button>
            )}
          </div>
        </TileAboveTheFoldContent>
        <TileBelowTheFoldContent>
          <RuleServeSelect variations={variations} variationId={defaultVariationId} defaultVariationOnly />
          <input type="hidden" name="defaultVariationId-existing" value={defaultVariationId} readOnly />
        </TileBelowTheFoldContent>
      </ExpandableTile>
    </div>
  );
}

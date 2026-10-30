// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { DiffType } from '../../typings/audits';
import styles from './DiffItem.module.scss';

interface DiffItemProps {
  newValue: string;
  oldValue: string;
  property: string;
  type: DiffType;
}

const propertiesTranslation = {
  archived: 'Archived',
  attribute: 'Attribute',
  clause: 'Clause',
  conditions: 'Conditions',
  context: 'Context',
  defaultServeKey: 'Default serve',
  defaultVariation: 'Default variation',
  description: 'Description',
  enabled: 'Enabled',
  operator: 'Operator',
  orderPosition: 'Order position',
  segmentKey: 'Segment key',
  serveVariationKey: 'Serve variation',
  serve: 'Serve',
  serveType: 'Serve type',
  values: 'Values',
};

export function DiffItem({ property, oldValue, newValue, type }: DiffItemProps) {
  const translatedProperty = propertiesTranslation[property as keyof typeof propertiesTranslation] || property;

  return (
    <li className={styles.change} key={`${property}-${oldValue}-${newValue}`}>
      {type === DiffType.Change && (
        <>
          {translatedProperty} from <span className={styles.changed}>"{oldValue}"</span> to{' '}
          <span className={styles.changed}>"{newValue}"</span>
        </>
      )}
      {type === DiffType.Remove && (
        <>
          {translatedProperty} as <span className={styles.changed}>"{oldValue}"</span>
        </>
      )}
      {type === DiffType.Add && (
        <>
          {translatedProperty} as <span className={styles.changed}>"{newValue}"</span>
        </>
      )}
    </li>
  );
}

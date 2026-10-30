// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'es-toolkit/predicate';
import ruleConditionAsNaturalLanguage from './ruleConditionAsNaturalLanguage';
import type { ChangeDataTypes } from '../typings/audits';
import valueToString from './valueToString';

const ignoredProperties = ['id', 'createdAt', 'updatedAt', 'serveVariationId'];

/**
 * Compare rules and return the differences.
 */
function compareRules(rule1: ChangeDataTypes['rule'], rule2: ChangeDataTypes['rule']) {
  const differences = [];

  for (const key in rule1) {
    if (ignoredProperties.includes(key)) {
      continue;
    }

    const oldValue = rule1[key as keyof typeof rule1];
    const newValue = rule2[key as keyof typeof rule1];

    if (!isEqual(oldValue, newValue)) {
      if (key === 'conditions') {
        differences.push({
          property: key,
          newValue: (newValue as ChangeDataTypes['rule']['conditions'])
            .map(ruleConditionAsNaturalLanguage)
            .join(' AND '),
          oldValue: (oldValue as ChangeDataTypes['rule']['conditions'])
            .map(ruleConditionAsNaturalLanguage)
            .join(' AND '),
        });

        continue;
      }

      differences.push({
        property: key,
        oldValue: valueToString(oldValue),
        newValue: valueToString(newValue),
      });
    }
  }

  return differences;
}

export default compareRules;

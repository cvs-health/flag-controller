// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { RuleServeType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import featureFlagRulesFormDataToRules from '../featureFlagRulesFormDataToRules';

describe('featureFlagRulesFormDataToRules', () => {
  it('should map each rule key to its parsed rule', () => {
    const formData = new FormData();
    formData.append('flagId', 'flag-id');
    formData.append('environmentId', 'environment-id');
    ['rule-one', 'rule-two'].forEach((key, index) => {
      formData.append('key', key);
      formData.append('id', `rule-id-${index}`);
      formData.append('removed', 'true');
      formData.append('created', 'false');
      formData.append('serveType', RuleServeType.Variation);
      formData.append('serveId', '');
    });

    expect(featureFlagRulesFormDataToRules(formData)).toEqual([
      {
        conditions: [],
        environmentId: 'environment-id',
        flagId: 'flag-id',
        id: 'rule-id-0',
        key: 'rule-one',
        created: false,
        orderPosition: 0,
        removed: true,
        serveVariationId: null,
        serveFractionalId: null,
        serve: null,
      },
      {
        conditions: [],
        environmentId: 'environment-id',
        flagId: 'flag-id',
        id: 'rule-id-1',
        key: 'rule-two',
        created: false,
        orderPosition: 1,
        removed: true,
        serveVariationId: null,
        serveFractionalId: null,
        serve: null,
      },
    ]);
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  type CreateFractional,
  FractionalType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  RuleServeType,
  RulesServeAction,
  type ContextRuleCondition,
  type UpdateFractional,
} from 'shared-types';
import { describe, expect, it } from 'vitest';

import isExistingRuleChanged from '../isExistingRuleChanged';

const baseCondition = {
  attribute: 'country',
  clause: Clause.If,
  context: 'user',
  operator: Operator.In,
  type: RuleConditionType.Context,
  values: 'US',
  valuesType: RuleConditionValueType.String,
} as ContextRuleCondition;

const existingRuleBase = {
  conditions: [baseCondition],
  created: false,
  environmentId: 'env-1',
  flagId: 'flag-1',
  id: 'rule-1',
  key: 'rule-1',
  orderPosition: 0,
  removed: false,
  serveFractional: null,
  serveFractionalId: null,
  serveVariationId: 'var-a',
  serveVariationKey: 'variation-key',
};

const updatedRuleBase = {
  conditions: [{ ...baseCondition, id: 'condition-1' }],
  created: false,
  environmentId: 'env-1',
  flagId: 'flag-1',
  id: 'rule-1',
  key: 'rule-1',
  orderPosition: 0,
  removed: false,
  serve: null,
  serveFractionalId: null,
  serveVariationId: 'var-a',
};

describe('isExistingRuleChanged', () => {
  it('returns false when rule and variation serve are unchanged', () => {
    expect(isExistingRuleChanged(existingRuleBase, updatedRuleBase)).toEqual(false);
  });

  it('returns true when variation serve id changes', () => {
    const updatedRule = {
      ...updatedRuleBase,
      serveVariationId: 'var-b',
    };

    expect(isExistingRuleChanged(existingRuleBase, updatedRule)).toEqual(true);
  });

  it('returns true when non-serve fields change', () => {
    const updatedRule = {
      ...updatedRuleBase,
      conditions: [
        {
          ...baseCondition,
          id: 'condition-2',
          values: 'US,CA',
        },
      ],
    };

    expect(isExistingRuleChanged(existingRuleBase, updatedRule)).toEqual(true);
  });

  it('returns true when fractional serve id changes', () => {
    const existingRule = {
      ...existingRuleBase,
      serveVariationId: null,
      serveFractionalId: 'fractional-1',
    };
    const updatedRule = {
      ...updatedRuleBase,
      serveVariationId: null,
      serveFractionalId: null,
      serve: {
        type: RuleServeType.Fractional,
        action: RulesServeAction.Update,
        id: 'fractional-2',
        value: {
          type: FractionalType.Contextual,
          var: 'user.country',
          weights: [
            ['var-a', 50],
            ['var-b', 50],
          ],
        },
      } satisfies UpdateFractional,
    };

    expect(isExistingRuleChanged(existingRule, updatedRule)).toEqual(true);
  });

  it('returns true when existing fractional serve id matches updated serve.id with Update action', () => {
    const existingRule = {
      ...existingRuleBase,
      serveVariationId: null,
      serveFractionalId: 'fractional-1',
    };
    const updatedRule = {
      ...updatedRuleBase,
      serveVariationId: null,
      serveFractionalId: null,
      serve: {
        type: RuleServeType.Fractional,
        action: RulesServeAction.Update,
        id: 'fractional-1',
        value: {
          type: FractionalType.Contextual,
          var: 'user.country',
          weights: [
            ['var-a', 50],
            ['var-b', 50],
          ],
        },
      } satisfies UpdateFractional,
    };

    expect(isExistingRuleChanged(existingRule, updatedRule)).toEqual(true);
  });

  it('returns true when updated rule adds a fractional serve to a non-fractional existing rule', () => {
    const updatedRule = {
      ...updatedRuleBase,
      serveVariationId: null,
      serveFractionalId: null,
      serve: {
        type: RuleServeType.Fractional,
        action: RulesServeAction.Create,
        value: {
          type: FractionalType.Contextual,
          var: 'user.country',
          weights: [
            ['var-a', 50],
            ['var-b', 50],
          ],
        },
      } satisfies CreateFractional,
    };

    expect(isExistingRuleChanged(existingRuleBase, updatedRule)).toEqual(true);
  });
});

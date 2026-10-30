// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  type ContextRuleCondition,
  type CreateFractional,
  FractionalType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  RuleServeType,
  RulesServeAction,
  type UpdateFractional,
} from 'shared-types';
import { describe, expect, it } from 'vitest';

import groupRulesByChange from '../groupRulesByChange';
import type { WithId } from '../../typings/common';

const baseCondition = {
  attribute: 'country',
  clause: Clause.If,
  context: 'user',
  id: 'condition-id',
  operator: Operator.In,
  type: RuleConditionType.Context,
  values: 'US,CA',
  valuesType: RuleConditionValueType.String,
} as WithId<ContextRuleCondition>;

const baseExistingRule = {
  conditions: [baseCondition],
  createdAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  environmentId: 'env-1',
  flagId: 'flag-1',
  id: 'rule-1',
  key: 'rule-1',
  orderPosition: 0,
  segmentId: null,
  serveFractional: null,
  serveFractionalId: null,
  serveVariationId: 'var-a',
  serveVariationKey: 'variation-key',
  updatedAt: '2024-01-01T00:00:00Z',
};

const baseParsedRule = {
  conditions: [baseCondition],
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

describe('groupRulesByChange', () => {
  it('categorizes created, updated, deleted, and unmodified rules using serve variation IDs', () => {
    const existingRules = [
      { ...baseExistingRule, id: 'rule-1', key: 'existing-rule-1', orderPosition: 0, serveVariationId: 'var-a' },
      { ...baseExistingRule, id: 'rule-2', key: 'existing-rule-2', orderPosition: 1, serveVariationId: 'var-b' },
      { ...baseExistingRule, id: 'rule-3', key: 'rule-to-delete', orderPosition: 2, serveVariationId: 'var-c' },
      { ...baseExistingRule, id: 'rule-4', key: 'rule-to-modify', orderPosition: 3, serveVariationId: 'var-d' },
    ];

    const parsedRules = [
      { ...baseParsedRule, id: 'rule-1', key: 'existing-rule-1', orderPosition: 0, serveVariationId: 'var-a' },
      { ...baseParsedRule, id: 'rule-2', key: 'existing-rule-2', orderPosition: 1, serveVariationId: 'var-z' },
      {
        ...baseParsedRule,
        id: 'rule-3',
        key: 'rule-to-delete',
        orderPosition: 2,
        removed: true,
        serveVariationId: 'var-c',
      },
      {
        ...baseParsedRule,
        id: 'rule-4',
        key: 'rule-to-modify',
        orderPosition: 3,
        conditions: [
          {
            ...baseCondition,
            id: 'condition-1',
            values: 'US,CA,GB',
          },
        ],
      },
      {
        ...baseParsedRule,
        id: 'new-rule-id',
        key: 'new-rule',
        orderPosition: 4,
        created: true,
        serveVariationId: 'var-new',
        conditions: [
          {
            ...baseCondition,
            id: 'condition-new',
            operator: Operator.StrictEquals,
            values: 'beta',
          },
        ],
      },
    ];

    const [newRules, updatedRules, deletedRules, unmodifiedRules] = groupRulesByChange(parsedRules, existingRules);

    expect(newRules).toHaveLength(1);
    expect(newRules[0]).not.toHaveProperty('id');
    expect(newRules[0]).toMatchObject({
      key: 'new-rule',
      orderPosition: 3,
      serveVariationId: 'var-new',
    });

    expect(updatedRules).toHaveLength(2);
    expect(updatedRules[0]).toMatchObject({
      id: 'rule-2',
      key: 'existing-rule-2',
      orderPosition: 1,
      serveVariationId: 'var-z',
    });
    expect(updatedRules[1]).toMatchObject({ id: 'rule-4', key: 'rule-to-modify', orderPosition: 2 });

    expect(deletedRules).toHaveLength(1);
    expect(deletedRules[0]).toMatchObject({ id: 'rule-3', key: 'rule-to-delete', orderPosition: 2 });

    expect(unmodifiedRules).toHaveLength(1);
    expect(unmodifiedRules[0]).toMatchObject({
      id: 'rule-1',
      key: 'existing-rule-1',
      orderPosition: 0,
      serveVariationId: 'var-a',
    });
  });

  it('treats fractional update as unmodified when fractional ID and rollout are unchanged', () => {
    const existingRules = [
      {
        ...baseExistingRule,
        id: 'rule-fractional',
        key: 'rule-fractional',
        serveVariationId: null,
        serveFractionalId: 'fractional-1',
      },
    ];
    const parsedRules = [
      {
        ...baseParsedRule,
        id: 'rule-fractional',
        key: 'rule-fractional',
        created: false,
        serveVariationId: null,
        serveFractionalId: 'fractional-1',
        serve: null,
      },
    ];

    const [newRules, updatedRules, deletedRules, unmodifiedRules] = groupRulesByChange(parsedRules, existingRules);

    expect(newRules).toHaveLength(0);
    expect(updatedRules).toHaveLength(0);
    expect(deletedRules).toHaveLength(0);
    expect(unmodifiedRules).toHaveLength(1);
  });

  it('treats fractional update as modified when rollout changes', () => {
    const existingRules = [
      {
        ...baseExistingRule,
        id: 'rule-fractional',
        key: 'rule-fractional',
        serveVariationId: null,
        serveFractionalId: 'fractional-1',
      },
    ];
    const parsedRules = [
      {
        ...baseParsedRule,
        id: 'rule-fractional',
        key: 'rule-fractional',
        serveVariationId: null,
        serveFractionalId: 'fractional-1',
        serve: {
          action: RulesServeAction.Update,
          id: 'fractional-1',
          type: RuleServeType.Fractional,
          value: {
            type: FractionalType.Contextual,
            var: 'user.country',
            weights: [
              ['var-a', 70],
              ['var-b', 30],
            ],
          },
        } as UpdateFractional,
      },
    ];

    const [, updatedRules, , unmodifiedRules] = groupRulesByChange(parsedRules, existingRules);

    expect(updatedRules).toHaveLength(1);
    expect(unmodifiedRules).toHaveLength(0);
  });

  it('treats fractional create action as modified', () => {
    const existingRules = [
      { ...baseExistingRule, id: 'rule-1', key: 'rule-1', serveVariationId: 'var-a', serveFractionalId: null },
    ];
    const parsedRules = [
      {
        ...baseParsedRule,
        id: 'rule-1',
        key: 'rule-1',
        serveVariationId: null,
        serveFractionalId: null,
        serve: {
          action: RulesServeAction.Create,
          type: RuleServeType.Fractional,
          value: {
            type: FractionalType.Contextual,
            var: 'user.country',
            weights: [
              ['var-a', 60],
              ['var-b', 40],
            ],
          },
        } as CreateFractional,
      },
    ];

    const [, updatedRules, , unmodifiedRules] = groupRulesByChange(parsedRules, existingRules);

    expect(updatedRules).toHaveLength(1);
    expect(unmodifiedRules).toHaveLength(0);
  });
});

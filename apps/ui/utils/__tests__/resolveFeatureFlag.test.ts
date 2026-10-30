// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  FeatureFlagType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  EnvironmentKey,
  type ContextRuleCondition,
  SegmentRuleCondition,
} from 'shared-types';
import { describe, expect, it } from 'vitest';

import resolveFeatureFlag from '../resolveFeatureFlag';

describe('resolveFeatureFlag', () => {
  it('returns a successful evaluation for boolean flag', () => {
    const variant = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-1',
      flagKey: 'flagKey',
      id: '1',
      key: 'enabled',
      updatedAt: '',
      value: true,
    };
    const segment = {
      applicationId: 'application-id',
      deletedAt: null,
      key: 'segmentKey',
      conditions: [],
      applicationName: 'applicationName',
      environmentKey: EnvironmentKey.Development,
      id: 'seg-1',
      createdAt: '',
      updatedAt: '',
      description: '',
      rules: [
        {
          conditions: [
            {
              attribute: 'attribute',
              operator: Operator.StartsWith,
              values: 'value',
              context: 'context',
              clause: Clause.And,
              type: RuleConditionType.Context,
              valuesType: RuleConditionValueType.String,
            } as ContextRuleCondition,
          ],
          createdAt: '',
          deletedAt: null,
          environmentId: 'env-1',
          flagId: 'flag-1',
          id: 'rule-1',
          key: 'ruleKey',
          orderPosition: 0,
          segmentId: 'seg-1',
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: 'var-1',
          serveVariationKey: 'enabled',
          updatedAt: '',
        },
      ],
    };
    const [result] = resolveFeatureFlag(
      [],
      [variant],
      'enabled',
      {},
      FeatureFlagType.Boolean,
      [segment],
      'applicationName',
    );

    expect(result).toEqual(`Serving variation 'enabled' with value 'true' due to no defined non-default rules.`);
  });

  it('returns a successful evaluation for string flag', () => {
    const variant = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'flagKey',
      id: '1',
      key: 'enabled',
      updatedAt: '',
      value: 'bar',
    };
    const [result] = resolveFeatureFlag([], [variant], 'enabled', {}, FeatureFlagType.String, [], 'applicationName');

    expect(result).toEqual(`Serving variation 'enabled' with value 'bar' due to no defined non-default rules.`);
  });

  it('returns a successful evaluation for integer flag', () => {
    const variant = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'flagKey',
      id: '1',
      key: 'enabled',
      updatedAt: '',
      value: 1,
    };
    const [result] = resolveFeatureFlag([], [variant], 'enabled', {}, FeatureFlagType.Integer, [], 'applicationName');

    expect(result).toEqual(`Serving variation 'enabled' with value '1' due to no defined non-default rules.`);
  });

  it('returns a successful evaluation for json flag', () => {
    const variant = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'flagKey',
      id: '1',
      key: 'enabled',
      updatedAt: '',
      value: {},
    };
    const [result] = resolveFeatureFlag([], [variant], 'enabled', {}, FeatureFlagType.Object, [], 'applicationName');

    expect(result).toEqual(`Serving variation 'enabled' with value '{}' due to no defined non-default rules.`);
  });

  it('accounts for conditions from targeting', () => {
    const variant = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'flagKey',
      id: '1',
      key: 'enabled',
      updatedAt: '',
      value: true,
    };
    const segment = {
      applicationId: 'applicationName',
      createdAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      description: 'Description',
      id: 'segment-id',
      key: 'segment-key',
      updatedAt: '2024-01-01T00:00:00Z',
      rules: [
        {
          conditions: [
            {
              attribute: 'id',
              operator: Operator.StrictEquals,
              values: '123',
              context: 'user',
              clause: Clause.If,
              type: RuleConditionType.Context,
              valuesType: RuleConditionValueType.String,
            } as ContextRuleCondition,
          ],
          createdAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
          environmentId: 'environment-id',
          flagId: null,
          id: 'rule-id',
          key: 'rule-key',
          orderPosition: 0,
          segmentId: 'segment-id',
          serveFractional: null,
          serveFractionalId: null,
          serveVariationId: null,
          serveVariationKey: null,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
    };
    const variant2 = {
      ...variant,
      id: '2',
      key: 'disabled',
      value: false,
    };
    const rules = [
      {
        conditions: [
          {
            attribute: 'id',
            operator: Operator.StrictEquals,
            values: '123',
            context: 'user',
            clause: Clause.If,
            type: RuleConditionType.Context,
            valuesType: RuleConditionValueType.String,
          } as ContextRuleCondition,
          {
            clause: Clause.And,
            segmentId: 'segment-id',
            operator: Operator.In,
            type: RuleConditionType.Segment,
          } as SegmentRuleCondition,
        ],
        createdAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
        environmentId: 'env-1',
        flagId: 'flag-1',
        id: 'rule-1',
        key: 'rule-key',
        orderPosition: 0,
        segmentId: null,
        serveFractional: null,
        serveFractionalId: null,
        serveVariationId: '1',
        serveVariationKey: variant.key,
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
    const [result] = resolveFeatureFlag(
      rules,
      [variant, variant2],
      'enabled',
      { user: { id: '123' } },
      FeatureFlagType.Boolean,
      [segment],
      'applicationName',
    );

    expect(result).toEqual(`Serving variation 'enabled' with value 'true' due to a match against a non-default rule.`);
  });
});

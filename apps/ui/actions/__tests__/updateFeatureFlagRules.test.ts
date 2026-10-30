// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  ErrorCode,
  FeatureFlagType,
  Operator,
  PROBLEM_TITLES,
  PROBLEM_TYPES,
  RuleConditionValueType,
  RuleServeType,
  EnvironmentKey,
  RuleConditionType,
} from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import updateFeatureFlagRules from '../updateFeatureFlagRules';
import { ActionStatus } from '../../typings/common';
import generateConditionId from '../../utils/generateConditionId';

describe('updateFeatureFlagRules', () => {
  it('should update existing, new, and deleted rules successfully', async () => {
    const data = {
      errorMessage: '',
      form: {
        applicationName: 'applicationName',
        defaultVariationId: 'variation-id',
        environmentKey: EnvironmentKey.Development,
        featureFlagKey: 'featureFlagKey',
        rules: '[]',
      },
      status: ActionStatus.Idle,
    };
    const formData = new FormData();
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    const rules = [
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            id: generateConditionId('rule-id-1', 0),
            operator: Operator.InList,
            values: 'US\nCA',
            valuesType: RuleConditionValueType.String,
          },
        ],
        removed: 'false',
        id: 'rule-id-1',
        key: 'rule-key',
        created: 'true',
        serve: '1',
        serveType: RuleServeType.Variation,
        type: FeatureFlagType.String,
      },
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            id: generateConditionId('rule-id-2', 0),
            operator: Operator.In,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        removed: 'false',
        id: 'rule-id-2',
        key: 'rule-key2',
        created: 'false',
        serve: '2',
        serveType: RuleServeType.Variation,
        type: FeatureFlagType.String,
      },
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            id: generateConditionId('rule-id-3', 0),
            operator: Operator.In,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        removed: 'true',
        id: 'rule-id-3',
        key: 'rule-key3',
        created: 'false',
        serve: '3',
        serveType: RuleServeType.Variation,
        type: FeatureFlagType.String,
      },
    ];

    Object.entries(data.form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('flagId', 'flag-id-123');
    formData.append('environmentId', 'env-id-456');

    rules.forEach((rule) => {
      rule.conditions.forEach((condition) => {
        formData.append(`${condition.id}-operator`, condition.operator);
        formData.append(`${condition.id}-attribute`, condition.attribute);
        formData.append(`${condition.id}-context`, condition.context);
        formData.append(`${condition.id}-clause`, condition.clause);
        formData.append(`${condition.id}-values`, condition.values);
        formData.append(`${condition.id}-valuesType`, condition.valuesType);
        formData.append(`${rule.id}-conditionId`, condition.id);
      });
      formData.append('removed', rule.removed);
      formData.append('id', rule.id);
      formData.append('key', rule.key);
      formData.append('created', rule.created);
      formData.append('serve', rule.serve);
      formData.append('serveType', rule.serveType);
      formData.append('type', rule.type);
    });

    formData.append(
      'variations',
      '[{"key":"variation-key", "id":1},{"key":"variation-key2", "id":2},{"key":"variation-key3", "id":3}]',
    );

    await updateFeatureFlagRules(data, formData);

    expect(fetch).toHaveBeenCalledTimes(4);
    // create rule
    expect(JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string)).toEqual([
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            operator: Operator.InList,
            type: RuleConditionType.Context,
            values: ['US', 'CA'],
            valuesType: RuleConditionValueType.String,
          },
        ],
        environmentId: 'env-id-456',
        flagId: 'flag-id-123',
        key: 'rule-key',
        orderPosition: 0,
        serve: null,
        serveFractionalId: null,
        serveVariationId: null,
      },
    ]);
    // delete rule (array of IDs)
    expect(JSON.parse(fetchSpy.mock.calls[1]?.[1]?.body as string)).toEqual(['rule-id-3']);
    // update existing rule
    expect(JSON.parse(fetchSpy.mock.calls[2]?.[1]?.body as string)).toEqual([
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        environmentId: 'env-id-456',
        flagId: 'flag-id-123',
        id: 'rule-id-2',
        key: 'rule-key2',
        orderPosition: 1,
        serve: null,
        serveFractionalId: null,
        serveVariationId: null,
      },
    ]);
  });

  it('should report partial failure when some rule operations fail', async () => {
    const data = {
      errorMessage: '',
      form: {
        applicationName: 'applicationName',
        defaultVariationId: 'variation-id',
        environmentKey: EnvironmentKey.Development,
        featureFlagKey: 'featureFlagKey',
        rules: '[]',
      },
      status: ActionStatus.Idle,
    };
    const formData = new FormData();
    const ruleAlreadyDeleted = JSON.stringify({
      type: PROBLEM_TYPES[ErrorCode.NotFound],
      title: PROBLEM_TITLES[ErrorCode.NotFound],
      status: 404,
      code: ErrorCode.NotFound,
      detail: 'That rule was already deleted.',
    });

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(resolvePromiseWithData([]))
      .mockResolvedValueOnce(resolvePromiseWithData(undefined, false, 404, ruleAlreadyDeleted))
      .mockResolvedValueOnce(resolvePromiseWithData({}));

    const rules = [
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            id: generateConditionId('rule-id-1', 0),
            operator: Operator.In,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        removed: 'false',
        id: 'rule-id-1',
        key: 'rule-key',
        created: 'true',
        serve: '1',
        serveType: RuleServeType.Variation,
        type: FeatureFlagType.String,
      },
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.And,
            context: 'user',
            id: generateConditionId('rule-id-2', 0),
            operator: Operator.In,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        removed: 'true',
        id: 'rule-id-2',
        key: 'rule-key2',
        created: 'false',
        serve: '2',
        serveType: RuleServeType.Variation,
        type: FeatureFlagType.String,
      },
    ];

    Object.entries(data.form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('flagId', 'flag-id-123');
    formData.append('environmentId', 'env-id-456');

    rules.forEach((rule) => {
      rule.conditions.forEach((condition) => {
        formData.append(`${condition.id}-operator`, condition.operator);
        formData.append(`${condition.id}-attribute`, condition.attribute);
        formData.append(`${condition.id}-context`, condition.context);
        formData.append(`${condition.id}-clause`, condition.clause);
        formData.append(`${condition.id}-values`, condition.values);
        formData.append(`${condition.id}-valuesType`, condition.valuesType);
        formData.append(`${rule.id}-conditionId`, condition.id);
      });
      formData.append('removed', rule.removed);
      formData.append('id', rule.id);
      formData.append('key', rule.key);
      formData.append('created', rule.created);
      formData.append('serve', rule.serve);
      formData.append('serveType', rule.serveType);
      formData.append('type', rule.type);
    });

    formData.append(
      'variations',
      '[{"key":"variation-key", "id":1},{"key":"variation-key2", "id":2},{"key":"variation-key3", "id":3}]',
    );

    const result = await updateFeatureFlagRules(data, formData);

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result.status).toBe(ActionStatus.Error);
    expect(result.errorMessage).toBe('That rule was already deleted.');
  });

  it('should reset the status', async () => {
    const state = {
      errorMessage: '',
      status: ActionStatus.Success,
      form: {},
    };
    const result = await updateFeatureFlagRules(state, undefined);

    expect(result).toEqual({
      ...state,
      form: {},
      status: ActionStatus.Idle,
    });
  });
});

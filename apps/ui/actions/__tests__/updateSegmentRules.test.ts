// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  Clause,
  ErrorCode,
  Operator,
  PROBLEM_TITLES,
  PROBLEM_TYPES,
  RuleConditionType,
  RuleConditionValueType,
} from 'shared-types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchRulesUrl } from '../../api/requests/patchRules';
import { postRulesUrl } from '../../api/requests/postRules';
import resolvePromiseWithData from '../../test/resolvePromiseWithData';
import updateSegmentRules from '../updateSegmentRules';

describe('updateSegmentRules', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a new segment rule through shared rules endpoint', async () => {
    const data = {
      environmentId: 'env-id-1',
      segmentId: 'segment-id-1',
      rules: '[]',
    };
    const formData = new FormData();

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('key', 'rule-key');
    formData.append('created', 'true');
    formData.append('context', 'user');
    formData.append('attribute', 'country');
    formData.append('operator', Operator.In);
    formData.append('values', 'US');

    await updateSegmentRules(data, formData);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe(`${process.env.API_BASE_URL}${postRulesUrl}`);
    expect(fetchSpy.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string)).toEqual([
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        environmentId: 'env-id-1',
        key: 'rule-key',
        orderPosition: 0,
        segmentId: 'segment-id-1',
      },
    ]);
  });

  it('should update an existing segment rule through shared rules endpoint', async () => {
    const existingRules = [
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        createdAt: '2026-06-10T12:00:00Z',
        deletedAt: null,
        environmentId: 'env-id-1',
        flagId: null,
        id: 'existing-rule-id',
        key: 'rule-key',
        orderPosition: 0,
        segmentId: 'segment-id-1',
        serveFractionalId: null,
        serveVariationId: null,
        updatedAt: '2026-06-10T12:00:00Z',
      },
    ];
    const data = {
      environmentId: 'env-id-1',
      segmentId: 'segment-id-1',
      rules: JSON.stringify(existingRules),
    };
    const formData = new FormData();

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('id', 'existing-rule-id');
    formData.append('key', 'rule-key');
    formData.append('created', 'false');
    formData.append('context', 'user');
    formData.append('attribute', 'country');
    formData.append('operator', Operator.In);
    formData.append('values', 'CA');

    await updateSegmentRules(data, formData);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe(`${process.env.API_BASE_URL}${patchRulesUrl}`);
    expect(fetchSpy.mock.calls[0]?.[1]?.method).toBe('PATCH');
    expect(JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string)).toEqual([
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'CA',
            valuesType: RuleConditionValueType.String,
          },
        ],
        id: 'existing-rule-id',
      },
    ]);
  });

  it('should not send a request when an existing segment rule is untouched', async () => {
    const existingRules = [
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        createdAt: '2026-06-10T12:00:00Z',
        deletedAt: null,
        environmentId: 'env-id-1',
        flagId: null,
        id: 'existing-rule-id',
        key: 'rule-key',
        orderPosition: 0,
        segmentId: 'segment-id-1',
        serveFractionalId: null,
        serveVariationId: null,
        updatedAt: '2026-06-10T12:00:00Z',
      },
    ];
    const data = {
      environmentId: 'env-id-1',
      segmentId: 'segment-id-1',
      rules: JSON.stringify(existingRules),
    };
    const formData = new FormData();

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData([]));
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('id', 'existing-rule-id');
    formData.append('key', 'rule-key');
    formData.append('created', 'false');
    formData.append('context', 'user');
    formData.append('attribute', 'country');
    formData.append('operator', Operator.In);
    formData.append('values', 'US');

    await updateSegmentRules(data, formData);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should report partial failure when one segment rule request fails', async () => {
    const existingRules = [
      {
        conditions: [
          {
            attribute: 'country',
            clause: Clause.If,
            context: 'user',
            operator: Operator.In,
            type: RuleConditionType.Context,
            values: 'US',
            valuesType: RuleConditionValueType.String,
          },
        ],
        createdAt: '2026-06-10T12:00:00Z',
        deletedAt: null,
        environmentId: 'env-id-1',
        flagId: null,
        id: 'existing-rule-id',
        key: 'rule-key',
        orderPosition: 0,
        segmentId: 'segment-id-1',
        serveFractionalId: null,
        serveVariationId: null,
        updatedAt: '2026-06-10T12:00:00Z',
      },
    ];
    const data = {
      environmentId: 'env-id-1',
      segmentId: 'segment-id-1',
      rules: JSON.stringify(existingRules),
    };
    const formData = new FormData();
    const staleRules = JSON.stringify({
      type: PROBLEM_TYPES[ErrorCode.Conflict],
      title: PROBLEM_TITLES[ErrorCode.Conflict],
      status: 409,
      code: ErrorCode.Conflict,
      detail: 'These rules were changed by someone else.',
    });

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData(undefined, false, 409, staleRules));

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('id', 'existing-rule-id');
    formData.append('key', 'rule-key');
    formData.append('created', 'false');
    formData.append('context', 'user');
    formData.append('attribute', 'country');
    formData.append('operator', Operator.In);
    formData.append('values', 'CA');

    const result = await updateSegmentRules(data, formData);

    expect(result.status).toBe('error');
    expect(result.errorMessage).toBe('These rules were changed by someone else.');
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ContextRuleCondition, FractionalWeight } from 'shared-types';
import {
  ActionType,
  Clause,
  EnvironmentKey,
  FeatureFlagType,
  FractionalType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  RuleServeType,
  SubjectType,
} from 'shared-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RulesCreate, RulesUpdate } from 'repositories/rulesRepository.js';
import type { RulesService } from '../rulesService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { RulesServeAction } from 'services/rulesService.js';
import { ForbiddenError, ValidationError } from '../../errors/AppError.js';
import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import { user } from 'test/setup.js';

describe('createRulesService', () => {
  let service: RulesService;
  const fractional = {
    id: 'fractional-1',
    type: FractionalType.Contextual,
    var: 'version',
    weights: [
      ['var-id', 50],
      ['var-id-2', 50],
    ] as FractionalWeight[],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };
  const variation = {
    id: 'variation-1',
    flagId: 'flag-1',
    key: 'on',
    value: 'enabled',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };
  const rule = {
    conditions: [] as ContextRuleCondition[],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    environmentId: 'env-1',
    flagId: 'flag-1',
    flagKey: 'flag-key',
    id: 'rule-1',
    key: 'default',
    orderPosition: 1,
    segmentId: null,
    segmentKey: null,
    serveFractional: null,
    serveFractionalId: null,
    serveVariationId: variation.id,
    serveVariationKey: variation.key,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };
  const segment = {
    id: 'segment-1',
    applicationId: 'app-1',
    applicationName: 'Application Name',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    description: 'Segment description',
    key: 'segment-key',
  };
  const featureFlag = {
    id: 'flag-1',
    applicationId: 'app-1',
    applicationName: 'Application Name',
    archived: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    description: 'Flag Description',
    key: 'flag-key',
    type: FeatureFlagType.Boolean,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };
  const flagEnvironment = {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    defaultServeId: 'default-serve-id',
    defaultServeKey: 'default-serve-key',
    deletedAt: null,
    enabled: true,
    environmentId: 'environment-id',
    environmentKey: EnvironmentKey.Development,
    flag: {
      applicationId: 'app-1',
      key: 'flag-key',
    },
    flagId: 'flag-id',
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };
  const logEntry = {
    action: ActionType.Create,
    actorId: user.id,
    applicationId: 'application-id',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    environmentId: 'environment-id',
    id: 'id',
    newData: null,
    oldData: null,
    subjectId: 'rule-id',
    subjectKey: 'subject-key',
    subjectType: SubjectType.Rule,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).mockResolvedValue(
      flagEnvironment,
    );
    vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
    vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
    vi.mocked(mockRepositories.segmentsRepository.getById).mockResolvedValue(segment);
    vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue(logEntry);
    service = createServiceWithMocks.rules;
  });

  describe('listRules', () => {
    it('fetches rules based on available params', async () => {
      const ruleResult = { ...rule, segmentKey: null, flagKey: 'flag-key' };
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([ruleResult]);
      vi.mocked(mockRepositories.rulesRepository.count).mockResolvedValue(25);

      const filters = {
        flagIds: [rule.flagId],
        segmentIds: [],
        include: { deleted: false },
      };

      const result = await service.listRules({
        filters,
        pagination: { page: 2, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.rulesRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters,
        pagination: {
          limit: 10,
          offset: 10,
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
      });
      expect(mockRepositories.rulesRepository.count).toHaveBeenCalledExactlyOnceWith(filters);
      expect(result).toEqual({
        data: [ruleResult],
        metadata: {
          page: 2,
          records: 1,
          rows: 10,
          totalPages: 3,
          totalRecords: 25,
        },
      });
    });

    it('fetches rules based on unavailable params', async () => {
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.rulesRepository.count).mockResolvedValue(0);

      const result = await service.listRules({
        pagination: { page: 1, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.rulesRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: undefined,
        pagination: {
          limit: 10,
          offset: 0,
        },
        sort: {
          direction: ColumnSortingDirection.DESC,
          field: 'createdAt',
        },
      });
      expect(mockRepositories.rulesRepository.count).toHaveBeenCalledExactlyOnceWith(undefined);
      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });
  });

  describe('createRule', () => {
    it('creates a rule for a segment', async () => {
      const payload = {
        conditions: rule.conditions,
        environmentId: rule.environmentId,
        key: rule.key,
        orderPosition: rule.orderPosition,
        segmentId: segment.id,
      };
      const createdRule = {
        ...payload,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        flagId: null,
        flagKey: rule.flagKey,
        id: 'rule-id',
        segmentId: null,
        segmentKey: null,
        serveFractional: null,
        serveFractionalId: null,
        serveVariationId: null,
        serveVariationKey: null,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(mockRepositories.segmentsRepository.findById).mockResolvedValue(segment);
      vi.mocked(mockRepositories.environmentsRepository.findById).mockResolvedValue({
        id: rule.environmentId,
        applicationId: segment.applicationId,
        key: EnvironmentKey.Development,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      });
      vi.mocked(mockRepositories.rulesRepository.create).mockResolvedValue(createdRule);

      const result = await service.createRule(payload, user.id);

      expect(mockRepositories.segmentsRepository.findById).toHaveBeenCalledExactlyOnceWith(segment.id);
      expect(mockRepositories.environmentsRepository.findById).toHaveBeenCalledExactlyOnceWith(rule.environmentId);
      expect(mockRepositories.rulesRepository.create).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(createdRule);
    });

    it('rejects a segment rule whose segment belongs to a different application than the environment', async () => {
      const payload = {
        conditions: rule.conditions,
        environmentId: rule.environmentId,
        key: rule.key,
        orderPosition: rule.orderPosition,
        segmentId: segment.id,
      };

      vi.mocked(mockRepositories.segmentsRepository.findById).mockResolvedValue({
        ...segment,
        applicationId: 'other-app',
      });
      vi.mocked(mockRepositories.environmentsRepository.findById).mockResolvedValue({
        id: rule.environmentId,
        applicationId: segment.applicationId,
        key: EnvironmentKey.Development,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      });

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'segmentId', code: 'INVALID' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('creates a rule with serveVariationId', async () => {
      const payload = {
        conditions: rule.conditions,
        environmentId: rule.environmentId,
        flagId: rule.flagId,
        key: rule.key,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: rule.serveVariationId,
      };

      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.rulesRepository.create).mockResolvedValue(rule);

      const result = await service.createRule(payload, user.id);

      expect(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).toHaveBeenCalledExactlyOnceWith(
        rule.flagId,
        rule.environmentId,
      );
      expect(mockRepositories.flagVariationsRepository.findById).toHaveBeenCalledExactlyOnceWith(rule.serveVariationId);
      expect(mockRepositories.rulesRepository.create).toHaveBeenCalledExactlyOnceWith({
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        key: rule.key,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveVariationId: rule.serveVariationId,
        serveFractionalId: null,
      });
      expect(result).toEqual(rule);
    });

    it('creates a rule with an orphaned serveFractionalId', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: fractional.id,
        serveVariationId: null,
      };
      const ruleWithFractional = { ...rule, serveVariationId: null, serveFractionalId: fractional.id };

      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.fractionalsRepository.findById).mockResolvedValue({ ...fractional, deletedAt: null });
      vi.mocked(mockRepositories.rulesRepository.create).mockResolvedValue(ruleWithFractional);

      const result = await service.createRule(payload, user.id);

      expect(mockRepositories.rulesRepository.exists).toHaveBeenCalledWith({
        serveFractionalIds: [fractional.id],
      });
      expect(mockRepositories.fractionalsRepository.findById).toHaveBeenCalledExactlyOnceWith(fractional.id);
      expect(mockRepositories.rulesRepository.create).toHaveBeenCalledExactlyOnceWith({
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        key: rule.key,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveVariationId: null,
        serveFractionalId: fractional.id,
      });
      expect(result).toEqual(ruleWithFractional);
    });

    it('rejects a create payload whose serveFractionalId is already attached to another rule', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: fractional.id,
        serveVariationId: null,
      };

      // `rulesRepository.exists` is used both for "rule with same key" (false) and the bridge
      // check "fractional already attached" (true). Discriminate on the filter.
      vi.mocked(mockRepositories.rulesRepository.exists).mockImplementation(async (filters) =>
        Boolean(filters.serveFractionalIds?.length),
      );

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'serveFractionalId', code: 'DUPLICATE' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('creates a rule with serve fractional', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      const ruleWithFractional = { ...rule, serveVariationId: null, serveFractionalId: fractional.id };

      vi.mocked(mockRepositories.fractionalsRepository.create).mockResolvedValue({ ...fractional, deletedAt: null });
      vi.mocked(mockRepositories.rulesRepository.create).mockResolvedValue(ruleWithFractional);

      const result = await service.createRule(payload, user.id);

      expect(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).toHaveBeenCalledExactlyOnceWith(
        rule.flagId,
        rule.environmentId,
      );
      expect(mockRepositories.fractionalsRepository.create).toHaveBeenCalledExactlyOnceWith(fractional);
      expect(mockRepositories.rulesRepository.create).toHaveBeenCalledExactlyOnceWith({
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        key: rule.key,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveVariationId: null,
        serveFractionalId: fractional.id,
      });
      expect(result).toEqual(ruleWithFractional);
    });

    it('throws when neither serve nor serveVariationId/serveFractionalId is provided', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: null,
      };

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve', code: 'REQUIRED' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when rule with same key exists for the flag environment', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: rule.serveVariationId,
      };

      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(true);

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 409,
        errors: [{ field: 'key', code: 'DUPLICATE' }],
      });
    });

    it('throws when the flag environment does not exist', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: rule.serveVariationId,
      };

      vi.mocked(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).mockResolvedValue(null);

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [
          { field: 'flagId', code: 'NOT_FOUND' },
          { field: 'environmentId', code: 'NOT_FOUND' },
        ],
      });
      expect(mockRepositories.flagVariationsRepository.findById).not.toHaveBeenCalled();
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when both serve and serveVariationId are provided', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: rule.serveVariationId,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve', code: 'INVALID' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when invalid action is provided for fractional serve', async () => {
      const payload = {
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Update as const,
          id: fractional.id,
          value: fractional,
        },
      };

      // @ts-expect-error: Testing invalid action
      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve.action', code: 'INVALID' }],
      });
      expect(mockRepositories.fractionalsRepository.create).not.toHaveBeenCalled();
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when invalid serve type is provided', async () => {
      const payload = {
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Variation as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      // @ts-expect-error: Testing invalid serve type
      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve.type', code: 'INVALID' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when serveVariationId does not exist', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: null,
        serveVariationId: 'variation-missing',
      };

      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(null);

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'serveVariationId', code: 'NOT_FOUND' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('throws when serveFractionalId does not exist', async () => {
      const payload = {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveFractionalId: 'fractional-missing',
        serveVariationId: null,
      };

      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.fractionalsRepository.findById).mockResolvedValue(null);

      await expect(service.createRule(payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'serveFractionalId', code: 'NOT_FOUND' }],
      });
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('rejects scalar values for list operators before authorization or writes', async () => {
      const payload = [
        {
          key: 'rule-key',
          flagId: rule.flagId,
          environmentId: rule.environmentId,
          conditions: [
            {
              attribute: 'country',
              clause: Clause.If,
              context: 'user',
              operator: Operator.InList,
              type: RuleConditionType.Context,
              values: 'US',
              valuesType: RuleConditionValueType.String,
            } as ContextRuleCondition,
          ],
          orderPosition: 1,
          serveFractionalId: null,
          serveVariationId: rule.serveVariationId,
        },
      ];

      const error = await service.createMany(payload, user.id).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toMatchObject({
        status: 400,
        errors: [{ field: '0.conditions.0.values', code: 'INVALID' }],
      });
      expect(mockAssertCanWrite).not.toHaveBeenCalled();
      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
    });

    it('creates multiple rules', async () => {
      const secondRule = { ...rule, id: 'rule-2', orderPosition: 2 };

      const payloads = [
        {
          key: rule.key,
          flagId: rule.flagId,
          environmentId: rule.environmentId,
          conditions: rule.conditions,
          orderPosition: rule.orderPosition,
          serveFractionalId: null,
          serveVariationId: rule.serveVariationId,
        },
        {
          key: secondRule.key,
          flagId: secondRule.flagId,
          environmentId: secondRule.environmentId,
          conditions: secondRule.conditions,
          orderPosition: secondRule.orderPosition,
          serveFractionalId: null,
          serveVariationId: secondRule.serveVariationId,
        },
      ];

      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.rulesRepository.create).mockResolvedValueOnce(rule).mockResolvedValueOnce(secondRule);

      const result = await service.createMany(payloads, user.id);

      expect(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).toHaveBeenNthCalledWith(
        1,
        rule.flagId,
        rule.environmentId,
      );
      expect(mockRepositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId).toHaveBeenNthCalledWith(
        2,
        secondRule.flagId,
        secondRule.environmentId,
      );
      expect(mockRepositories.rulesRepository.create).toHaveBeenNthCalledWith(1, {
        key: rule.key,
        flagId: rule.flagId,
        environmentId: rule.environmentId,
        conditions: rule.conditions,
        orderPosition: rule.orderPosition,
        serveVariationId: rule.serveVariationId,
        serveFractionalId: null,
      });
      expect(mockRepositories.rulesRepository.create).toHaveBeenNthCalledWith(2, {
        key: secondRule.key,
        flagId: secondRule.flagId,
        environmentId: secondRule.environmentId,
        conditions: secondRule.conditions,
        orderPosition: secondRule.orderPosition,
        serveVariationId: secondRule.serveVariationId,
        serveFractionalId: null,
      });
      expect(result).toEqual([rule, secondRule]);
    });

    it('handles empty array', async () => {
      const result = await service.createMany([], user.id);

      expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('updateMany', () => {
    it('rejects scalar values for list operators before authorization or writes', async () => {
      const payload = [
        {
          id: rule.id,
          conditions: [
            {
              attribute: 'country',
              clause: Clause.If,
              context: 'user',
              operator: Operator.NotInList,
              type: RuleConditionType.Context,
              values: 'US',
              valuesType: RuleConditionValueType.String,
            } as ContextRuleCondition,
          ],
        },
      ];

      const error = await service.updateMany(payload, user.id).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toMatchObject({
        status: 400,
        errors: [{ field: '0.conditions.0.values', code: 'INVALID' }],
      });
      expect(mockAssertCanWrite).not.toHaveBeenCalled();
      expect(mockRepositories.rulesRepository.updateById).not.toHaveBeenCalled();
    });

    it('updates multiple rules', async () => {
      const updatedRule = {
        ...rule,
        conditions: [
          { context: 'email', operator: Operator.StrictEquals, values: 'test@example.com', clause: Clause.And },
        ] as ContextRuleCondition[],
      };
      const secondRule = { ...rule, id: 'rule-2', key: 'custom' };
      const updatedSecondRule = { ...secondRule, key: 'updated-custom' };

      const payloads = [
        { id: rule.id, conditions: updatedRule.conditions },
        { id: secondRule.id, key: updatedSecondRule.key },
      ];

      vi.mocked(mockRepositories.rulesRepository.updateById)
        .mockResolvedValueOnce(updatedRule)
        .mockResolvedValueOnce(updatedSecondRule);
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(updatedRule);

      const result = await service.updateMany(payloads, user.id);

      expect(mockRepositories.rulesRepository.updateById).toHaveBeenNthCalledWith(1, rule.id, {
        conditions: updatedRule.conditions,
      });
      expect(mockRepositories.rulesRepository.updateById).toHaveBeenNthCalledWith(2, secondRule.id, {
        key: updatedSecondRule.key,
      });
      expect(result).toEqual([updatedRule, updatedSecondRule]);
    });

    it('handles partial updates', async () => {
      const payload = [{ id: rule.id, orderPosition: 5 }];
      const updatedRule = { ...rule, orderPosition: 5 };

      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(updatedRule);
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(updatedRule);

      const result = await service.updateMany(payload, user.id);

      expect(mockRepositories.rulesRepository.updateById).toHaveBeenCalledExactlyOnceWith(rule.id, {
        orderPosition: 5,
      });
      expect(result).toEqual([updatedRule]);
    });
  });

  describe('updateRule', () => {
    it('updates a feature flag rule', async () => {
      const updatedRule = { ...rule, orderPosition: 2 };

      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(rule);
      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(updatedRule);

      const result = await service.updateRule(rule.id, { orderPosition: 2 }, user.id);

      expect(mockRepositories.rulesRepository.getById).toHaveBeenCalledExactlyOnceWith(rule.id);
      expect(mockRepositories.rulesRepository.updateById).toHaveBeenCalledExactlyOnceWith(rule.id, {
        orderPosition: 2,
      });
      expect(mockRepositories.featureFlagsRepository.getById).toHaveBeenCalledExactlyOnceWith(updatedRule.flagId);
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledWith({
        action: ActionType.Edit,
        actorId: user.id,
        applicationId: featureFlag.applicationId,
        environmentId: updatedRule.environmentId,
        subjectId: updatedRule.id,
        subjectKey: updatedRule.key,
        subjectType: SubjectType.Rule,
        newData: updatedRule,
        oldData: rule,
      });
      expect(result).toEqual(updatedRule);
    });

    it('updates a segment rule', async () => {
      const segmentRule = {
        ...rule,
        flagId: null,
        segmentId: segment.id,
        serveVariationId: null,
        serveVariationKey: null,
      };

      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(segmentRule);
      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(segmentRule);

      const result = await service.updateRule(segmentRule.id, { orderPosition: 2 }, user.id);

      expect(mockRepositories.segmentsRepository.getById).toHaveBeenCalledExactlyOnceWith(segment.id);
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledWith({
        action: ActionType.Edit,
        actorId: user.id,
        applicationId: segment.applicationId,
        environmentId: segmentRule.environmentId,
        subjectId: segmentRule.id,
        subjectKey: segmentRule.key,
        subjectType: SubjectType.Rule,
        newData: segmentRule,
        oldData: segmentRule,
      });
      expect(result).toEqual(segmentRule);
    });

    it('throws when serve is provided for a segment update payload', async () => {
      const payload = {
        key: segment.key,
        segmentId: segment.id,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      await expect(service.updateRule(rule.id, payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve', code: 'INVALID' }],
      });
    });

    it('throws when both serve and serveVariationId are provided in update payload', async () => {
      const payload = {
        key: rule.key,
        serveVariationId: variation.id,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      await expect(service.updateRule(rule.id, payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve', code: 'INVALID' }],
      });
    });

    it('creates a fractional during update when serve action is create', async () => {
      const updatedRule = {
        ...rule,
        serveFractionalId: fractional.id,
        serveVariationId: null,
        serveVariationKey: null,
      };
      const payload = {
        key: rule.key,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      vi.mocked(mockRepositories.fractionalsRepository.create).mockResolvedValue({ ...fractional, deletedAt: null });
      vi.mocked(mockRepositories.fractionalsRepository.findById).mockResolvedValue({ ...fractional, deletedAt: null });
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(rule);
      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(updatedRule);

      const result = await service.updateRule(rule.id, payload, user.id);

      expect(mockRepositories.fractionalsRepository.create).toHaveBeenCalledExactlyOnceWith(fractional);
      expect(mockRepositories.rulesRepository.updateById).toHaveBeenCalledExactlyOnceWith(rule.id, {
        key: rule.key,
        serveFractionalId: fractional.id,
        serveVariationId: null,
      });
      expect(result).toEqual(updatedRule);
    });

    it('updates an existing fractional when serve action is update', async () => {
      const existingRule = { ...rule, serveFractionalId: fractional.id };
      const payload = {
        key: rule.key,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Update as const,
          id: fractional.id,
          value: fractional,
        },
      };

      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(existingRule);
      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(existingRule);

      const result = await service.updateRule(rule.id, payload, user.id);

      expect(mockRepositories.fractionalsRepository.updateById).toHaveBeenCalledExactlyOnceWith(
        fractional.id,
        fractional,
      );
      expect(result).toEqual(existingRule);
    });

    it("rejects an update whose serve.id does not match the rule's existing serveFractionalId", async () => {
      const existingRule = { ...rule, serveFractionalId: 'fractional-owned-by-this-rule' };
      const payload = {
        key: rule.key,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Fractional as const,
          action: RulesServeAction.Update as const,
          id: 'fractional-from-another-rule',
          value: fractional,
        },
      };

      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(existingRule);

      await expect(service.updateRule(rule.id, payload, user.id)).rejects.toMatchObject({
        status: 422,
        errors: [{ field: 'serve.id', code: 'INVALID' }],
      });
      expect(mockRepositories.fractionalsRepository.updateById).not.toHaveBeenCalled();
    });

    it('throws when invalid serve type is provided for update', async () => {
      const payload = {
        key: rule.key,
        serveVariationId: null,
        serve: {
          type: RuleServeType.Variation as const,
          action: RulesServeAction.Create as const,
          value: fractional,
        },
      };

      // @ts-expect-error: Intentionally invalid serve type for this path.
      await expect(service.updateRule(rule.id, payload, user.id)).rejects.toMatchObject({
        status: 400,
        errors: [{ field: 'serve.type', code: 'INVALID' }],
      });
    });

    it('rejects an update whose serveFractionalId is already attached to another rule', async () => {
      const existingRule = { ...rule, serveFractionalId: 'fractional-owned-by-this-rule' };
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(existingRule);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(true);

      await expect(
        service.updateRule(rule.id, { serveFractionalId: 'fractional-from-another-rule' } as never, user.id),
      ).rejects.toMatchObject({ status: 422, errors: [{ field: 'serveFractionalId', code: 'DUPLICATE' }] });
      expect(mockRepositories.rulesRepository.updateById).not.toHaveBeenCalled();
    });

    it('allows an update to point at an orphaned serveFractionalId', async () => {
      const existingRule = { ...rule, serveFractionalId: 'fractional-owned-by-this-rule' };
      const updatedRule = { ...existingRule, serveFractionalId: 'orphaned-fractional' };
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(existingRule);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.fractionalsRepository.findById).mockResolvedValue({
        ...fractional,
        id: 'orphaned-fractional',
        deletedAt: null,
      });
      vi.mocked(mockRepositories.rulesRepository.updateById).mockResolvedValue(updatedRule);

      const result = await service.updateRule(rule.id, { serveFractionalId: 'orphaned-fractional' } as never, user.id);

      expect(mockRepositories.rulesRepository.exists).toHaveBeenCalledWith({
        serveFractionalIds: ['orphaned-fractional'],
      });
      expect(result).toEqual(updatedRule);
    });

    it('throws when referenced fractional does not exist in update payload', async () => {
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue({ ...rule, serveFractionalId: null });
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.fractionalsRepository.findById).mockResolvedValue(null);

      await expect(
        service.updateRule(rule.id, { serveFractionalId: 'fractional-missing' } as never, user.id),
      ).rejects.toMatchObject({ status: 422, errors: [{ field: 'serveFractionalId', code: 'NOT_FOUND' }] });
    });

    it('throws when referenced variation does not exist in update payload', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(null);
      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(rule);

      await expect(
        service.updateRule(
          rule.id,
          {
            serveVariationId: 'variation-missing',
          },
          user.id,
        ),
      ).rejects.toMatchObject({ status: 422, errors: [{ field: 'serveVariationId', code: 'NOT_FOUND' }] });
    });

    it('rejects an update whose serveVariationId belongs to a different flag than the rule', async () => {
      const existingRule = { ...rule, flagId: 'flag-1' };
      const foreignVariation = { ...variation, id: 'var-from-other-flag', flagId: 'flag-2' };

      vi.mocked(mockRepositories.rulesRepository.getById).mockResolvedValue(existingRule);
      vi.mocked(mockRepositories.flagVariationsRepository.findById).mockResolvedValue(foreignVariation);

      await expect(
        service.updateRule(rule.id, { serveVariationId: foreignVariation.id } as never, user.id),
      ).rejects.toMatchObject({ status: 422, errors: [{ field: 'serveVariationId', code: 'INVALID' }] });
      expect(mockRepositories.rulesRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('deleteMany', () => {
    it('deletes multiple rules', async () => {
      const secondRule = { ...rule, id: 'rule-2' };
      const ids = [rule.id, secondRule.id];

      vi.mocked(mockRepositories.rulesRepository.hardDeleteMany).mockResolvedValue([rule, secondRule]);

      const result = await service.deleteMany(ids, user.id);

      expect(mockRepositories.rulesRepository.hardDeleteMany).toHaveBeenCalledExactlyOnceWith(ids);
      expect(result).toEqual([rule, secondRule]);
    });

    it('handles single rule deletion', async () => {
      const ids = [rule.id];

      vi.mocked(mockRepositories.rulesRepository.hardDeleteMany).mockResolvedValue([rule]);

      const result = await service.deleteMany(ids, user.id);

      expect(mockRepositories.rulesRepository.hardDeleteMany).toHaveBeenCalledExactlyOnceWith(ids);
      expect(result).toEqual([rule]);
    });

    it('handles empty array', async () => {
      vi.mocked(mockRepositories.rulesRepository.hardDeleteMany).mockResolvedValue([]);

      const result = await service.deleteMany([], user.id);

      expect(mockRepositories.rulesRepository.hardDeleteMany).toHaveBeenCalledExactlyOnceWith([]);
      expect(result).toEqual([]);
    });
  });

  describe('authorization', () => {
    beforeEach(() => {
      mockAssertCanWrite.mockRejectedValue(notAMemberError());
    });

    afterEach(() => {
      mockAssertCanWrite.mockReset();
    });

    describe('createRule', () => {
      it('authorizes on the target environment before writing', async () => {
        await expect(
          service.createRule({ environmentId: 'env-1' } as unknown as RulesCreate, 'user-1'),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'environment', 'env-1');
        expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('createMany', () => {
      it('authorizes the full environment id set before writing', async () => {
        await expect(
          service.createMany(
            [
              { environmentId: 'env-1' } as unknown as RulesCreate,
              { environmentId: 'env-2' } as unknown as RulesCreate,
            ],
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'environment', ['env-1', 'env-2']);
        expect(mockRepositories.rulesRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateRule', () => {
      it('authorizes on the rule before writing', async () => {
        await expect(service.updateRule('rule-1', {} as unknown as RulesUpdate, 'user-1')).rejects.toBeInstanceOf(
          ForbiddenError,
        );
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'rule', 'rule-1');
        expect(mockRepositories.rulesRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('updateMany', () => {
      it('authorizes the full rule id set before writing', async () => {
        await expect(
          service.updateMany(
            [{ id: 'rule-1' } as unknown as RulesUpdate, { id: 'rule-2' } as unknown as RulesUpdate],
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'rule', ['rule-1', 'rule-2']);
        expect(mockRepositories.rulesRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('deleteMany', () => {
      it('authorizes the full rule id set before writing', async () => {
        await expect(service.deleteMany(['rule-1', 'rule-2'], 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'rule', ['rule-1', 'rule-2']);
        expect(mockRepositories.rulesRepository.hardDeleteMany).not.toHaveBeenCalled();
      });
    });
  });
});

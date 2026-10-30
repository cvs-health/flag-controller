// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Clause,
  type ContextRuleCondition,
  EnvironmentKey,
  FeatureFlagType,
  FractionalType,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type SegmentRuleCondition,
  type FractionalWeight,
} from 'shared-types';

import { ColumnSortingDirection } from '../../types/common.js';
import type { FlagdService } from 'services/flagdService.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';

describe('createFlagdService', () => {
  let service: FlagdService;

  const application = {
    id: 'app-id',
    name: 'test-app',
    teamId: 'team-id',
    teamName: 'test-team',
    description: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  };
  const featureFlags = [
    {
      id: 'flag-boolean',
      key: 'flag-boolean',
      applicationId: application.id,
      applicationName: application.name,
      description: 'Boolean flag',
      type: FeatureFlagType.Boolean,
      archived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    },
    {
      id: 'flag-integer',
      key: 'flag-integer',
      applicationId: application.id,
      applicationName: application.name,
      description: 'Integer flag',
      type: FeatureFlagType.Integer,
      archived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    },
    {
      id: 'flag-string',
      key: 'flag-string',
      applicationId: application.id,
      applicationName: application.name,
      description: 'String flag',
      type: FeatureFlagType.String,
      archived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    },
    {
      id: 'flag-object',
      key: 'flag-object',
      applicationId: application.id,
      applicationName: application.name,
      description: 'Object flag',
      type: FeatureFlagType.Object,
      archived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    },
  ];
  const [booleanFlag, integerFlag, stringFlag, objectFlag] = featureFlags;

  const variations = [
    {
      id: 'boolean-on',
      applicationId: application.id,
      flagKey: booleanFlag.key,
      key: 'on',
      value: 'true',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: booleanFlag.id,
    },
    {
      id: 'boolean-off',
      applicationId: application.id,
      flagKey: booleanFlag.key,
      key: 'off',
      value: 'false',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: booleanFlag.id,
    },
    {
      id: 'integer-low',
      applicationId: application.id,
      flagKey: integerFlag.key,
      key: 'low',
      value: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: integerFlag.id,
    },
    {
      id: 'integer-high',
      applicationId: application.id,
      flagKey: integerFlag.key,
      key: 'high',
      value: '10',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: integerFlag.id,
    },
    {
      id: 'string-control',
      applicationId: application.id,
      flagKey: stringFlag.key,
      key: 'control',
      value: 'alpha',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: stringFlag.id,
    },
    {
      id: 'string-treatment',
      applicationId: application.id,
      flagKey: stringFlag.key,
      key: 'treatment',
      value: 'beta',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: stringFlag.id,
    },
    {
      id: 'object-small',
      applicationId: application.id,
      flagKey: objectFlag.key,
      key: 'small',
      value: '{"tier":"small"}',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: objectFlag.id,
    },
    {
      id: 'object-large',
      applicationId: application.id,
      flagKey: objectFlag.key,
      key: 'large',
      value: '{"tier":"large"}',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      flagId: objectFlag.id,
    },
  ];
  const [
    variationBooleanOn,
    variationBooleanOff,
    variationIntegerLow,
    variationIntegerHigh,
    variationStringControl,
    variationStringTreatment,
    variationJsonSmall,
    variationJsonLarge,
  ] = variations;
  const segment = {
    applicationId: application.id,
    applicationName: application.name,
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    description: 'Test segment',
    environmentKey: 'development',
    id: 'segment-id',
    key: 'test-segment',
    updatedAt: new Date('2024-01-02'),
    flagTargetCount: 1,
  };
  const secondSegment = {
    ...segment,
    description: 'Second test segment',
    id: 'segment-id-2',
    key: 'test-segment-two',
  };
  const segmentRule = {
    conditions: [
      {
        clause: Clause.If,
        context: 'user',
        operator: Operator.StrictEquals,
        type: RuleConditionType.Context,
        values: 'test@example.com',
        valuesType: RuleConditionValueType.String,
      } as ContextRuleCondition,
    ],
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    flagId: null,
    id: 'segment-rule-id',
    key: 'segment-rule-1',
    orderPosition: 1,
    segmentId: segment.id,
    updatedAt: new Date('2024-01-01'),
    environmentId: 'env-development',
    flagKey: null,
    segmentKey: segment.key,
    serveFractionalId: null,
    serveFractional: null,
    serveVariationId: null,
    serveVariationKey: null,
  };
  const segmentRuleProduction = {
    ...segmentRule,
    environmentId: 'env-production',
  };
  const secondSegmentRule = {
    ...segmentRule,
    conditions: [
      {
        clause: Clause.If,
        context: 'user',
        operator: Operator.StrictEquals,
        type: RuleConditionType.Context,
        values: 'vip@example.com',
        valuesType: RuleConditionValueType.String,
      } as ContextRuleCondition,
    ],
    id: 'segment-rule-id-2',
    key: 'segment-rule-2',
    segmentId: secondSegment.id,
    segmentKey: secondSegment.key,
  };
  const flagVariationRule = {
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    flagId: stringFlag.id,
    flagKey: stringFlag.key,
    id: 'flag-variation-rule-id',
    key: 'flag-variation-rule',
    orderPosition: 1,
    segmentId: null,
    segmentKey: null,
    serveFractional: null,
    serveFractionalId: null,
    serveVariationId: variationStringTreatment.id,
    serveVariationKey: variationStringTreatment.key,
    updatedAt: new Date('2024-01-02'),
    conditions: [
      {
        clause: Clause.If,
        context: 'user',
        operator: Operator.StrictEquals,
        type: RuleConditionType.Context,
        values: 'test@example.com',
        valuesType: RuleConditionValueType.String,
      } as ContextRuleCondition,
    ],
    environmentId: 'env-development',
  };
  const flagFractionalRule = {
    ...flagVariationRule,
    id: 'flag-rule-id',
    key: 'flag-fractional-rule',
    segmentId: null,
    flagId: integerFlag.id,
    flagKey: integerFlag.key,
    serveVariationId: null,
    serveVariationKey: null,
    serveFractionalId: 'fractional-id',
  };
  const flagVariationRuleProduction = {
    ...flagVariationRule,
    id: 'flag-variation-rule-production-id',
    key: 'flag-variation-rule-production',
    environmentId: 'env-production',
    segmentKey: segment.key,
    conditions: [
      {
        clause: Clause.If,
        operator: Operator.StrictEquals,
        segmentId: segment.id,
        type: RuleConditionType.Segment,
      } as SegmentRuleCondition,
    ],
  };
  const booleanVariationRuleProduction = {
    ...flagVariationRule,
    flagId: booleanFlag.id,
    flagKey: booleanFlag.key,
    id: 'flag-boolean-rule-production-id',
    key: 'flag-boolean-rule-production',
    environmentId: 'env-production',
    serveVariationId: variationBooleanOn.id,
    serveVariationKey: variationBooleanOn.key,
    conditions: [
      {
        clause: Clause.If,
        operator: Operator.StrictEquals,
        segmentId: secondSegment.id,
        type: RuleConditionType.Segment,
      } as SegmentRuleCondition,
    ],
  };
  const environments = [
    {
      applicationId: application.id,
      createdAt: new Date('2024-01-01'),
      deletedAt: null,
      id: 'env-development',
      key: EnvironmentKey.Development,
      updatedAt: new Date('2024-01-02'),
    },
    {
      applicationId: application.id,
      createdAt: new Date('2024-01-01'),
      deletedAt: null,
      id: 'env-production',
      key: EnvironmentKey.Production,
      updatedAt: new Date('2024-01-02'),
    },
  ];
  const [developmentEnvironment, productionEnvironment] = environments;

  const flag = {
    applicationId: application.id,
    key: 'feature-flag-key',
  };
  const flagEnvironments = [
    {
      flag,
      flagId: booleanFlag.id,
      environmentId: developmentEnvironment.id,
      environmentKey: developmentEnvironment.key,
      enabled: true,
      defaultServeId: variationBooleanOn.id,
      defaultServeKey: variationBooleanOn.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: booleanFlag.id,
      environmentId: productionEnvironment.id,
      environmentKey: productionEnvironment.key,
      enabled: true,
      defaultServeId: variationBooleanOff.id,
      defaultServeKey: variationBooleanOff.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: integerFlag.id,
      environmentId: developmentEnvironment.id,
      environmentKey: developmentEnvironment.key,
      enabled: true,
      defaultServeId: variationIntegerLow.id,
      defaultServeKey: variationIntegerLow.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: integerFlag.id,
      environmentId: productionEnvironment.id,
      environmentKey: productionEnvironment.key,
      enabled: true,
      defaultServeId: variationIntegerHigh.id,
      defaultServeKey: variationIntegerHigh.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: stringFlag.id,
      environmentId: developmentEnvironment.id,
      environmentKey: developmentEnvironment.key,
      enabled: true,
      defaultServeId: variationStringControl.id,
      defaultServeKey: variationStringControl.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: stringFlag.id,
      environmentId: productionEnvironment.id,
      environmentKey: productionEnvironment.key,
      enabled: true,
      defaultServeId: variationStringTreatment.id,
      defaultServeKey: variationStringTreatment.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: objectFlag.id,
      environmentId: developmentEnvironment.id,
      environmentKey: developmentEnvironment.key,
      enabled: true,
      defaultServeId: variationJsonSmall.id,
      defaultServeKey: variationJsonSmall.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      flag,
      flagId: objectFlag.id,
      environmentId: productionEnvironment.id,
      environmentKey: productionEnvironment.key,
      enabled: true,
      defaultServeId: variationJsonLarge.id,
      defaultServeKey: variationJsonLarge.key,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const fractional = {
    id: 'fractional-id',
    type: FractionalType.WeightOnly,
    weights: [
      [variationIntegerLow.id, 30],
      [variationIntegerHigh.id, 70],
    ] as FractionalWeight[],
    var: 'user.id',
    applicationId: application.id,
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
    updatedAt: new Date('2024-01-02'),
  };

  beforeEach(() => {
    service = createServiceWithMocks.flagd;
  });

  describe('getFlagdConfiguration', () => {
    it('provides a complete configuration', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue(
        featureFlags.map((flag) => ({ ...flag, applicationName: application.name })),
      );
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue(flagEnvironments);
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([
        segmentRule,
        segmentRuleProduction,
        secondSegmentRule,
        flagFractionalRule,
        flagVariationRule,
        flagVariationRuleProduction,
        booleanVariationRuleProduction,
      ]);
      vi.mocked(mockRepositories.flagVariationsRepository.list).mockResolvedValue(variations);
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([segment, secondSegment]);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([application]);
      vi.mocked(mockRepositories.fractionalsRepository.list).mockResolvedValue([fractional]);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue(environments);

      const result = await service.getFlagdConfiguration();
      const flagIds = featureFlags.map((flag) => flag.id);

      expect(mockRepositories.featureFlagsRepository.list).toHaveBeenCalledExactlyOnceWith({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.flagEnvironmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { flagIds },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.rulesRepository.list).toHaveBeenCalledExactlyOnceWith({
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        sort: { field: 'orderPosition', direction: ColumnSortingDirection.ASC },
      });
      expect(mockRepositories.flagVariationsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { flagIds },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.segmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { segmentIds: [segment.id, secondSegment.id] },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.fractionalsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { fractionalIds: [fractional.id] },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(mockRepositories.environmentsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: { environmentIds: [developmentEnvironment.id, productionEnvironment.id] },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(result.$evaluators).toEqual({
        'test-app/development/test-segment': {
          '===': [
            {
              var: 'user',
            },
            'test@example.com',
          ],
        },
        'test-app/production/test-segment': {
          '===': [
            {
              var: 'user',
            },
            'test@example.com',
          ],
        },
        'test-app/development/test-segment-two': {
          '===': [
            {
              var: 'user',
            },
            'vip@example.com',
          ],
        },
      });
      expect(result.flags).toEqual([
        {
          defaultVariant: variationBooleanOn.key,
          key: booleanFlag.key,
          state: 'ENABLED',
          targeting: {},
          variants: { on: true, off: false },
          metadata: { flagSetId: 'test-app-development' },
        },
        {
          defaultVariant: variationBooleanOff.key,
          key: booleanFlag.key,
          state: 'ENABLED',
          targeting: {
            if: [
              {
                $ref: 'test-app/production/test-segment-two',
              },
              variationBooleanOn.key,
            ],
          },
          variants: { on: true, off: false },
          metadata: { flagSetId: 'test-app-production' },
        },
        {
          defaultVariant: variationIntegerLow.key,
          key: integerFlag.key,
          state: 'ENABLED',
          targeting: {
            if: [
              {
                '===': [{ var: 'user' }, 'test@example.com'],
              },
              {
                fractional: [
                  {
                    cat: [{ var: '$flagd.flagKey' }, { var: 'user.id' }],
                  },
                  [variationIntegerLow.key, 30],
                  [variationIntegerHigh.key, 70],
                ],
              },
            ],
          },
          variants: { low: 1, high: 10 },
          metadata: { flagSetId: 'test-app-development' },
        },
        {
          defaultVariant: variationIntegerHigh.key,
          key: integerFlag.key,
          state: 'ENABLED',
          targeting: {},
          variants: { low: 1, high: 10 },
          metadata: { flagSetId: 'test-app-production' },
        },
        {
          defaultVariant: variationStringControl.key,
          key: stringFlag.key,
          state: 'ENABLED',
          targeting: {
            if: [
              {
                '===': [{ var: 'user' }, 'test@example.com'],
              },
              variationStringTreatment.key,
            ],
          },
          variants: { control: 'alpha', treatment: 'beta' },
          metadata: { flagSetId: 'test-app-development' },
        },
        {
          defaultVariant: variationStringTreatment.key,
          key: stringFlag.key,
          state: 'ENABLED',
          targeting: {
            if: [
              {
                $ref: 'test-app/production/test-segment',
              },
              'treatment',
            ],
          },
          variants: { control: 'alpha', treatment: 'beta' },
          metadata: { flagSetId: 'test-app-production' },
        },
        {
          defaultVariant: variationJsonSmall.key,
          key: objectFlag.key,
          state: 'ENABLED',
          targeting: {},
          variants: {
            small: { tier: 'small' },
            large: { tier: 'large' },
          },
          metadata: { flagSetId: 'test-app-development' },
        },
        {
          defaultVariant: variationJsonLarge.key,
          key: objectFlag.key,
          state: 'ENABLED',
          targeting: {},
          variants: {
            small: { tier: 'small' },
            large: { tier: 'large' },
          },
          metadata: { flagSetId: 'test-app-production' },
        },
      ]);
    });

    it('resolves a default serve that points at a soft-deleted variation', async () => {
      const retiredVariation = {
        id: 'boolean-retired',
        applicationId: application.id,
        flagKey: booleanFlag.key,
        flagId: booleanFlag.id,
        key: 'retired',
        value: 'false',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-02-01'),
      };
      const orphanedFlagEnvironment = {
        flag,
        flagId: booleanFlag.id,
        environmentId: developmentEnvironment.id,
        environmentKey: developmentEnvironment.key,
        enabled: true,
        defaultServeId: retiredVariation.id,
        defaultServeKey: retiredVariation.key,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([booleanFlag]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([orphanedFlagEnvironment]);
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([]);
      // The active-variation query never returns the retired default serve.
      vi.mocked(mockRepositories.flagVariationsRepository.list)
        .mockResolvedValueOnce([variationBooleanOn])
        .mockResolvedValueOnce([retiredVariation]);
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([application]);
      vi.mocked(mockRepositories.fractionalsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([developmentEnvironment]);

      const result = await service.getFlagdConfiguration();

      expect(mockRepositories.flagVariationsRepository.list).toHaveBeenNthCalledWith(2, {
        filters: { ids: [retiredVariation.id], include: { deleted: true } },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });
      expect(result.flags).toEqual([
        {
          key: booleanFlag.key,
          state: 'ENABLED',
          defaultVariant: retiredVariation.key,
          targeting: {},
          variants: { on: true, retired: false },
          metadata: { flagSetId: 'test-app-development' },
        },
      ]);
    });

    it('returns empty configuration when there is no data', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.rulesRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.flagVariationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.segmentsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.applicationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.environmentsRepository.list).mockResolvedValue([]);

      const result = await service.getFlagdConfiguration();

      expect(result).toEqual({
        flags: [],
        $evaluators: {},
      });
    });

    it('wraps an unexpected failure as InternalError with the cause', async () => {
      const cause = new Error('Database error');
      vi.mocked(mockRepositories.featureFlagsRepository.list).mockRejectedValue(cause);

      await expect(service.getFlagdConfiguration()).rejects.toMatchObject({ status: 500, cause });
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import {
  type CreateFractional,
  type UpdateFractional,
  RuleServeType,
  type UpdateFeatureFlagRulePayload,
  type UpdateSegmentRulePayload,
  type CreateSegmentRulePayload,
  type CreateFeatureFlagRulePayload,
  ActionType,
  FieldErrorCode,
  SubjectType,
  RuleConditionType,
} from 'shared-types';

import type {
  RulesCreate,
  RulesFilters,
  RulesSelect,
  RulesSelectJoined,
  RulesUpdate,
} from 'repositories/rulesRepository.js';
import type { AssertCanWrite } from 'services/authorizationService.js';
import type { Repositories } from 'utils/createRepositories.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import validateRuleConditions from 'utils/validateRuleConditions.js';
import { ConflictError, UnprocessableError, ValidationError } from '../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';

export enum RulesServeAction {
  Create = 'create',
  Update = 'update',
}

export type RulesService = ReturnType<typeof createRulesService>;

type CreateRulePayload = RulesCreate & {
  serve?: CreateFractional;
};
type UpdateFeatureFlagRuleInput = Omit<UpdateFeatureFlagRulePayload, 'id'> & {
  serve?: UpdateFractional | CreateFractional;
};
type UpdateSegmentRuleInput = Omit<UpdateSegmentRulePayload, 'id'> & {
  serve?: never;
};
type UpdateRulePayload = UpdateFeatureFlagRuleInput | UpdateSegmentRuleInput;
type UpdateRuleData = Omit<UpdateRulePayload, 'serve'>;
type UpdateFeatureFlagRuleData = Omit<UpdateFeatureFlagRuleInput, 'serve'>;

function createRulesService({ repositories, withTransaction, assertCanWrite }: ServiceDependencies) {
  const service = {
    createRule: async (payload: CreateRulePayload, actorId: string) => {
      validateRuleConditions(payload.conditions);
      await preAuthorizeCreate(assertCanWrite, actorId, payload);

      return withTransaction((repos) => createRuleInTx(repos, payload, actorId));
    },

    createMany: async (payload: RulesCreate[], actorId: string) => {
      payload.forEach((rule, index) => {
        validateRuleConditions(rule.conditions, `${index}.conditions`);
      });

      // Authorize every referenced id across the batch upfront so a partially-authorized batch
      // can never commit some items before rejecting a later one.
      await assertCanWrite(actorId, 'environment', [...new Set(payload.map((r) => r.environmentId))]);

      const segmentIds = [...new Set(payload.filter(isCreateSegmentRule).map((r) => r.segmentId))];
      if (segmentIds.length) await assertCanWrite(actorId, 'segment', segmentIds);

      const flagRules = payload.filter(isCreateFeatureFlagRule);
      const flagIds = [...new Set(flagRules.map((r) => r.flagId))];
      if (flagIds.length) await assertCanWrite(actorId, 'featureFlag', flagIds);

      const variationIds = [
        ...new Set(flagRules.map((r) => r.serveVariationId).filter((id): id is string => Boolean(id))),
      ];
      if (variationIds.length) await assertCanWrite(actorId, 'variation', variationIds);

      return withTransaction(async (repos) => {
        const rules = [];
        for (const rule of payload) {
          rules.push(await createRuleInTx(repos, rule, actorId));
        }
        return rules;
      });
    },

    listRules: async (params: ServiceListParams<RulesSelect, RulesFilters>) => {
      const [rulesResult, countResult] = await Promise.all([
        repositories.rulesRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            direction: params.sort.direction,
            field: params.sort.field,
          },
        }),
        repositories.rulesRepository.count(params.filters),
      ]);
      const baseResponse = {
        data: [],
        metadata: {
          page: params.pagination.page,
          records: rulesResult.length,
          rows: params.pagination.rows,
          totalPages: params.pagination.rows > 0 ? Math.ceil(countResult / params.pagination.rows) : 0,
          totalRecords: countResult,
        },
      };

      if (!rulesResult.length) {
        return baseResponse;
      }

      return {
        ...baseResponse,
        data: rulesResult,
      };
    },

    updateMany: async (payload: RulesUpdate[], actorId: string) => {
      payload.forEach((rule, index) => {
        validateRuleConditions(rule.conditions, `${index}.conditions`);
      });

      await assertCanWrite(
        actorId,
        'rule',
        payload.map((p) => p.id),
      );

      return withTransaction(async (repos) => {
        const rules = [];
        for (const { id, ...rule } of payload) {
          rules.push(await updateRuleInTx(repos, id, rule, actorId));
        }
        return rules;
      });
    },

    deleteMany: async (ids: string[], actorId: string) => {
      await assertCanWrite(actorId, 'rule', ids);

      return withTransaction(async (repos) => {
        const rules = await repos.rulesRepository.hardDeleteMany(ids);
        await Promise.all(
          rules.map(async (rule) => {
            if (rule.flagId) {
              const featureFlag = await repos.featureFlagsRepository.getById(rule.flagId);

              await repos.logsRepository.create({
                action: ActionType.Delete,
                actorId,
                applicationId: featureFlag.applicationId,
                environmentId: rule.environmentId,
                subjectId: rule.id,
                subjectKey: rule.key,
                subjectType: SubjectType.Rule,
                newData: null,
                oldData: rule,
              });
            } else if (rule.segmentId) {
              const segment = await repos.segmentsRepository.getById(rule.segmentId);

              await repos.logsRepository.create({
                action: ActionType.Delete,
                actorId,
                applicationId: segment.applicationId,
                environmentId: rule.environmentId,
                subjectId: rule.id,
                subjectKey: rule.key,
                subjectType: SubjectType.Rule,
                newData: null,
                oldData: rule,
              });
            }
          }),
        );

        return rules;
      });
    },

    updateRule: async (id: string, payload: UpdateRulePayload, actorId: string) => {
      validateRuleConditions(payload.conditions);
      await assertCanWrite(actorId, 'rule', id);

      return withTransaction((repos) => updateRuleInTx(repos, id, payload, actorId));
    },
  };

  return service;
}

async function preAuthorizeCreate(
  assertCanWrite: AssertCanWrite,
  actorId: string,
  payload: CreateRulePayload,
): Promise<void> {
  await assertCanWrite(actorId, 'environment', payload.environmentId);

  if (isCreateSegmentRule(payload)) {
    await assertCanWrite(actorId, 'segment', payload.segmentId);
  } else if (isCreateFeatureFlagRule(payload)) {
    await assertCanWrite(actorId, 'featureFlag', payload.flagId);
    if (payload.serveVariationId) {
      await assertCanWrite(actorId, 'variation', payload.serveVariationId);
    }
  }
}

async function createRuleInTx(repos: Repositories, payload: CreateRulePayload, actorId: string) {
  const { serve, ...ruleData } = payload;

  if (isCreateSegmentRule(ruleData)) {
    const [environment, segment] = await Promise.all([
      repos.environmentsRepository.findById(ruleData.environmentId),
      repos.segmentsRepository.findById(ruleData.segmentId),
    ]);

    if (!environment) {
      throw new UnprocessableError({
        message: `Environment not found for environmentId ${ruleData.environmentId}`,
        detail: 'The referenced environment does not exist.',
        errors: [{ field: 'environmentId', code: FieldErrorCode.NotFound }],
        context: { environmentId: ruleData.environmentId },
      });
    }
    if (!segment) {
      throw new UnprocessableError({
        message: `Segment not found for segmentId ${ruleData.segmentId}`,
        detail: 'The referenced segment does not exist.',
        errors: [{ field: 'segmentId', code: FieldErrorCode.NotFound }],
        context: { segmentId: ruleData.segmentId },
      });
    }
    if (segment.applicationId !== environment.applicationId) {
      throw new UnprocessableError({
        message: 'Segment and environment must belong to the same application',
        detail: 'Segment and environment must belong to the same application.',
        errors: [{ field: 'segmentId', code: FieldErrorCode.Invalid }],
        context: { segmentId: ruleData.segmentId, environmentId: ruleData.environmentId },
      });
    }

    const rule = await repos.rulesRepository.create(ruleData);

    await repos.logsRepository.create({
      action: ActionType.Create,
      actorId,
      applicationId: segment.applicationId,
      environmentId: ruleData.environmentId,
      subjectId: rule.id,
      subjectKey: rule.key,
      subjectType: SubjectType.Rule,
      newData: rule,
      oldData: null,
    });

    return rule;
  }

  if (isCreateFeatureFlagRule(ruleData)) {
    let fractionalId = null;

    const flagEnvironment = await repos.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId(
      ruleData.flagId,
      ruleData.environmentId,
    );

    if (!flagEnvironment) {
      throw new UnprocessableError({
        message: `Flag environment not found for flagId ${ruleData.flagId} and environmentId ${ruleData.environmentId}`,
        detail: 'The feature flag is not configured for this environment.',
        errors: [
          { field: 'flagId', code: FieldErrorCode.NotFound },
          { field: 'environmentId', code: FieldErrorCode.NotFound },
        ],
        context: { flagId: ruleData.flagId, environmentId: ruleData.environmentId },
      });
    }

    const ruleExists = await repos.rulesRepository.exists({
      environmentIds: [ruleData.environmentId],
      flagIds: [ruleData.flagId],
      keys: [ruleData.key],
    });

    if (ruleExists) {
      throw new ConflictError({
        message: `Rule with key ${ruleData.key} already exists for flagId ${ruleData.flagId} and environmentId ${ruleData.environmentId}`,
        detail: 'A rule with this key already exists for this feature flag and environment.',
        errors: [{ field: 'key', code: FieldErrorCode.Duplicate }],
        context: { key: ruleData.key, flagId: ruleData.flagId, environmentId: ruleData.environmentId },
      });
    }

    // Reject reuse of a fractional already attached to a rule (proxy for team-ownership until
    // fractionals become first-class).
    if (ruleData.serveFractionalId) {
      const attached = await repos.rulesRepository.exists({
        serveFractionalIds: [ruleData.serveFractionalId],
      });
      if (attached) {
        throw new UnprocessableError({
          message: 'Cannot reuse a fractional that is already attached to another rule',
          detail: 'This fractional rollout is already attached to another rule.',
          errors: [{ field: 'serveFractionalId', code: FieldErrorCode.Duplicate }],
          context: { serveFractionalId: ruleData.serveFractionalId },
        });
      }
    }

    if (!serve && !(ruleData.serveFractionalId || ruleData.serveVariationId)) {
      throw new ValidationError({
        message: 'Either serve, serveFractionalId, or serveVariationId must be provided',
        detail: 'Either serve, serveFractionalId, or serveVariationId must be provided.',
        errors: [{ field: 'serve', code: FieldErrorCode.Required }],
      });
    }

    if (serve) {
      if (ruleData.serveFractionalId || ruleData.serveVariationId) {
        throw new ValidationError({
          message: 'Cannot provide both serve and serveFractionalId or serveVariationId',
          detail: 'Provide either serve or a serve id, not both.',
          errors: [{ field: 'serve', code: FieldErrorCode.Invalid }],
        });
      }

      if (serve.type === RuleServeType.Fractional) {
        if (serve.action === RulesServeAction.Create) {
          const fractional = await repos.fractionalsRepository.create(serve.value);

          fractionalId = fractional.id;
        } else {
          throw new ValidationError({
            message: `Invalid action for ${RuleServeType.Fractional} serve type when creating a rule: ${serve.action}`,
            detail: `Only "${RulesServeAction.Create}" is allowed when creating a rule.`,
            errors: [{ field: 'serve.action', code: FieldErrorCode.Invalid }],
          });
        }
      } else {
        throw new ValidationError({
          message: `Invalid serve type when creating a rule: ${serve.type}`,
          detail: `Only "${RuleServeType.Fractional}" is allowed when creating a rule.`,
          errors: [{ field: 'serve.type', code: FieldErrorCode.Invalid }],
        });
      }
    }

    if (ruleData.serveFractionalId) {
      const fractional = await repos.fractionalsRepository.findById(ruleData.serveFractionalId);

      if (!fractional) {
        throw new UnprocessableError({
          message: `Fractional with id ${ruleData.serveFractionalId} not found`,
          detail: 'The referenced fractional rollout does not exist.',
          errors: [{ field: 'serveFractionalId', code: FieldErrorCode.NotFound }],
          context: { serveFractionalId: ruleData.serveFractionalId },
        });
      }
    }

    if (ruleData.serveVariationId) {
      const variation = await repos.flagVariationsRepository.findById(ruleData.serveVariationId);

      if (!variation) {
        throw new UnprocessableError({
          message: `Variation with id ${ruleData.serveVariationId} not found`,
          detail: 'The referenced variation does not exist.',
          errors: [{ field: 'serveVariationId', code: FieldErrorCode.NotFound }],
          context: { serveVariationId: ruleData.serveVariationId },
        });
      }
      if (variation.flagId !== ruleData.flagId) {
        throw new UnprocessableError({
          message: 'Variation must belong to the rule flag',
          detail: 'The variation must belong to this feature flag.',
          errors: [{ field: 'serveVariationId', code: FieldErrorCode.Invalid }],
          context: { serveVariationId: ruleData.serveVariationId, flagId: ruleData.flagId },
        });
      }
    }

    const data = {
      ...ruleData,
      serveFractionalId: ruleData.serveFractionalId ?? fractionalId,
      serveVariationId: ruleData.serveVariationId ?? null,
    };

    const rule = await repos.rulesRepository.create(data);
    const [newData] = await addSegmentKeysToRuleConditions([rule], repos);

    await repos.logsRepository.create({
      action: ActionType.Create,
      actorId,
      applicationId: flagEnvironment.flag.applicationId,
      environmentId: flagEnvironment.environmentId,
      subjectId: rule.id,
      subjectKey: rule.key,
      subjectType: SubjectType.Rule,
      newData,
      oldData: null,
    });

    return rule;
  }

  throw new ValidationError({
    message: 'Either segmentId or flagId must be provided to create a rule',
    detail: 'Either segmentId or flagId must be provided.',
  });
}

async function updateRuleInTx(repos: Repositories, id: string, payload: UpdateRulePayload, actorId: string) {
  const { serve, ...ruleData } = payload;
  const existingRule = await repos.rulesRepository.getById(id);

  // Same bridge as create. Runs before `serve` processing so it only guards the raw payload;
  // `serve.action = Create` writes a fresh (orphan) id below.
  if (
    isUpdateFeatureFlagRule(ruleData) &&
    ruleData.serveFractionalId != null &&
    ruleData.serveFractionalId !== existingRule.serveFractionalId
  ) {
    const attached = await repos.rulesRepository.exists({
      serveFractionalIds: [ruleData.serveFractionalId],
    });
    if (attached) {
      throw new UnprocessableError({
        message: 'Cannot reuse a fractional that is already attached to another rule',
        detail: 'This fractional rollout is already attached to another rule.',
        errors: [{ field: 'serveFractionalId', code: FieldErrorCode.Duplicate }],
        context: { ruleId: id },
      });
    }
  }

  if (serve) {
    if (!isUpdateFeatureFlagRule(ruleData)) {
      throw new ValidationError({
        message: 'Serve can only be provided for feature flag rule updates',
        detail: 'Serve can only be provided for feature flag rules.',
        errors: [{ field: 'serve', code: FieldErrorCode.Invalid }],
      });
    }

    if (ruleData.serveFractionalId || ruleData.serveVariationId) {
      throw new ValidationError({
        message: 'Cannot provide both serve and serveFractionalId or serveVariationId',
        detail: 'Provide either serve or a serve id, not both.',
        errors: [{ field: 'serve', code: FieldErrorCode.Invalid }],
      });
    }

    if (serve.type === RuleServeType.Fractional) {
      if (serve.action === RulesServeAction.Create) {
        const fractional = await repos.fractionalsRepository.create(serve.value);

        ruleData.serveFractionalId = fractional.id;
      } else if (serve.action === RulesServeAction.Update) {
        // serve.id must be the fractional already attached to this rule.
        if (serve.id !== existingRule.serveFractionalId) {
          throw new UnprocessableError({
            message: 'Fractional does not belong to this rule',
            detail: 'The fractional rollout does not belong to this rule.',
            errors: [{ field: 'serve.id', code: FieldErrorCode.Invalid }],
            context: { ruleId: id, serveId: serve.id },
          });
        }
        await repos.fractionalsRepository.updateById(serve.id, serve.value);
      } else {
        throw new ValidationError({
          message: `Invalid action for ${RuleServeType.Fractional} serve type when updating a rule`,
          detail: `Only "${RulesServeAction.Create}" or "${RulesServeAction.Update}" are allowed when updating a rule.`,
          errors: [{ field: 'serve.action', code: FieldErrorCode.Invalid }],
        });
      }
    } else {
      throw new ValidationError({
        message: `Invalid serve type when updating a rule: ${serve.type}`,
        detail: `Only "${RuleServeType.Fractional}" is allowed when updating a rule.`,
        errors: [{ field: 'serve.type', code: FieldErrorCode.Invalid }],
      });
    }
  }

  if (isUpdateFeatureFlagRule(ruleData) && ruleData.serveFractionalId != null) {
    const fractional = await repos.fractionalsRepository.findById(ruleData.serveFractionalId);

    if (!fractional) {
      throw new UnprocessableError({
        message: `Fractional with id ${ruleData.serveFractionalId} not found`,
        detail: 'The referenced fractional rollout does not exist.',
        errors: [{ field: 'serveFractionalId', code: FieldErrorCode.NotFound }],
        context: { serveFractionalId: ruleData.serveFractionalId },
      });
    }
  }

  if (isUpdateFeatureFlagRule(ruleData) && ruleData.serveVariationId) {
    const variation = await repos.flagVariationsRepository.findById(ruleData.serveVariationId);

    if (!variation) {
      throw new UnprocessableError({
        message: `Variation with id ${ruleData.serveVariationId} not found`,
        detail: 'The referenced variation does not exist.',
        errors: [{ field: 'serveVariationId', code: FieldErrorCode.NotFound }],
        context: { serveVariationId: ruleData.serveVariationId },
      });
    }
    if (variation.flagId !== existingRule.flagId) {
      throw new UnprocessableError({
        message: 'Variation must belong to the rule flag',
        detail: 'The variation must belong to this feature flag.',
        errors: [{ field: 'serveVariationId', code: FieldErrorCode.Invalid }],
        context: { serveVariationId: ruleData.serveVariationId, flagId: existingRule.flagId },
      });
    }
  }

  const rule = await repos.rulesRepository.updateById(id, ruleData);

  if (rule.flagId) {
    const featureFlag = await repos.featureFlagsRepository.getById(rule.flagId);
    const [newData, oldData] = await addSegmentKeysToRuleConditions([rule, existingRule], repos);

    await repos.logsRepository.create({
      action: ActionType.Edit,
      actorId,
      applicationId: featureFlag.applicationId,
      environmentId: rule.environmentId,
      subjectId: rule.id,
      subjectKey: rule.key,
      subjectType: SubjectType.Rule,
      newData,
      oldData,
    });
  } else if (rule.segmentId) {
    const segment = await repos.segmentsRepository.getById(rule.segmentId);

    await repos.logsRepository.create({
      action: ActionType.Edit,
      actorId,
      applicationId: segment.applicationId,
      environmentId: rule.environmentId,
      subjectId: rule.id,
      subjectKey: rule.key,
      subjectType: SubjectType.Rule,
      newData: rule,
      oldData: existingRule,
    });
  }

  return rule;
}

function isCreateSegmentRule(data: RulesCreate): data is CreateSegmentRulePayload {
  return 'segmentId' in data;
}

function isCreateFeatureFlagRule(data: RulesCreate): data is CreateFeatureFlagRulePayload {
  return 'flagId' in data;
}

function isUpdateFeatureFlagRule(data: UpdateRuleData): data is UpdateFeatureFlagRuleData {
  return 'serveFractionalId' in data || 'serveVariationId' in data;
}

async function addSegmentKeysToRuleConditions(rules: RulesSelectJoined[], repositories: Repositories) {
  let updatedRules = [...rules];
  const conditionSegmentIds = rules.flatMap((rule) =>
    Array.from(
      rule.conditions.reduce((segmentIds, condition) => {
        if (condition.type === RuleConditionType.Segment) {
          segmentIds.add(condition.segmentId);
        }
        return segmentIds;
      }, new Set<string>()),
    ),
  );

  if (conditionSegmentIds.length) {
    const segments = await repositories.segmentsRepository.list({
      filters: { segmentIds: conditionSegmentIds },
      pagination: { offset: 0, limit: PAGINATION_NO_LIMIT },
    });
    const segmentKeyById = new Map(segments.map((segment) => [segment.id, segment.key]));

    updatedRules = updatedRules.map((rule) => ({
      ...rule,
      conditions: rule.conditions.map((condition) => {
        if (condition.type !== RuleConditionType.Segment) {
          return condition;
        }

        const segmentKey = segmentKeyById.get(condition.segmentId);

        return segmentKey ? { ...condition, segmentKey } : condition;
      }),
    }));
  }

  return updatedRules;
}

export default createRulesService;

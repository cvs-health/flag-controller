// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, FeatureFlagType, FieldErrorCode, SubjectType } from 'shared-types';

import type {
  FlagVariationsCreate,
  FlagVariationsListFilters,
  FlagVariationsSelect,
  FlagVariationsUpdate,
} from 'repositories/flagVariationsRepository.js';
import type { Repositories } from 'utils/createRepositories.js';
import validateVariationValuesByFeatureFlagType from 'utils/validateVariationValuesByFeatureFlagType.js';
import { UnprocessableError, ValidationError } from '../errors/AppError.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';

export type VariationsService = ReturnType<typeof createVariationsService>;

function createVariationsService({ repositories, withTransaction, assertCanWrite }: ServiceDependencies) {
  const service = {
    listVariations: async (params: ServiceListParams<FlagVariationsSelect, FlagVariationsListFilters>) => {
      const [variationsResults, countResult] = await Promise.all([
        repositories.flagVariationsRepository.list({
          filters: params.filters,
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: params.sort,
        }),
        repositories.flagVariationsRepository.count(params.filters),
      ]);

      return {
        data: variationsResults,
        metadata: {
          page: params.pagination.page,
          records: variationsResults.length,
          rows: params.pagination.rows,
          totalPages: params.pagination.rows > 0 ? Math.ceil(countResult / params.pagination.rows) : 0,
          totalRecords: countResult,
        },
      };
    },

    createVariation: async (payload: FlagVariationsCreate, actorId: string) => {
      await assertCanWrite(actorId, 'featureFlag', payload.flagId);

      return withTransaction((repos) => createVariationInTx(repos, payload, actorId));
    },

    createManyVariations: async (payload: FlagVariationsCreate[], actorId: string) => {
      const flagIds = [...new Set(payload.map((v) => v.flagId))];
      await assertCanWrite(actorId, 'featureFlag', flagIds);

      return withTransaction(async (repos) => {
        const results = [];
        for (const variation of payload) {
          results.push(await createVariationInTx(repos, variation, actorId));
        }
        return results;
      });
    },

    updateVariation: async (id: string, payload: FlagVariationsUpdate, actorId: string) => {
      await assertCanWrite(actorId, 'variation', id);

      return withTransaction((repos) => updateVariationInTx(repos, id, payload, actorId));
    },

    updateManyVariations: async (
      payload: (FlagVariationsUpdate & Pick<FlagVariationsSelect, 'id'>)[],
      actorId: string,
    ) => {
      const ids = payload.map((v) => v.id);
      await assertCanWrite(actorId, 'variation', ids);

      return withTransaction(async (repos) => {
        const results = [];
        for (const variation of payload) {
          results.push(await updateVariationInTx(repos, variation.id, variation, actorId));
        }
        return results;
      });
    },

    deleteVariation: async (id: string, actorId: string) => {
      await assertCanWrite(actorId, 'variation', id);

      return withTransaction((repos) => deleteVariationInTx(repos, id, actorId));
    },

    deleteManyVariations: async (ids: string[], actorId: string) => {
      await assertCanWrite(actorId, 'variation', ids);

      return withTransaction(async (repos) => {
        const results = [];
        for (const id of ids) {
          results.push(await deleteVariationInTx(repos, id, actorId));
        }
        return results;
      });
    },
  };

  return service;
}

async function createVariationInTx(repos: Repositories, payload: FlagVariationsCreate, actorId: string) {
  const featureFlag = await repos.featureFlagsRepository.getById(payload.flagId);
  const featureFlagVariationsCount = await repos.flagVariationsRepository.count({
    flagIds: [payload.flagId],
  });

  if (featureFlag?.type === FeatureFlagType.Boolean && featureFlagVariationsCount >= 2) {
    throw new UnprocessableError({
      message: "Feature flags of type 'boolean' can have at most two variations",
      detail: 'Boolean feature flags can have at most two variations.',
      errors: [{ field: 'variations', code: FieldErrorCode.TooLong }],
      context: { flagId: payload.flagId },
    });
  }

  validateVariationValuesByFeatureFlagType(featureFlag.type, { [payload.key]: payload.value });

  const result = await repos.flagVariationsRepository.create(payload);

  await repos.logsRepository.create({
    action: ActionType.Create,
    actorId,
    applicationId: featureFlag.applicationId,
    newData: { key: payload.key, value: payload.value },
    oldData: null,
    subjectId: result.id,
    subjectKey: result.key,
    subjectType: SubjectType.Variation,
  });

  return result;
}

async function updateVariationInTx(repos: Repositories, id: string, payload: FlagVariationsUpdate, actorId: string) {
  const variation = await repos.flagVariationsRepository.getById(id);
  const featureFlag = await repos.featureFlagsRepository.getById(variation.flagId);

  if (!payload.key && payload.value === undefined) {
    throw new ValidationError({
      message: 'At least one of key or value must be provided',
      detail: 'At least one of key or value must be provided.',
    });
  }

  if (payload.value !== undefined) {
    validateVariationValuesByFeatureFlagType(featureFlag.type, { [payload.key || variation.key]: payload.value });
  }

  const updateData: FlagVariationsUpdate = {
    key: variation.key,
    value: variation.value,
  };

  if (payload.key !== undefined && payload.key !== variation.key) {
    updateData.key = payload.key;
  }
  if (payload.value !== undefined && payload.value !== variation.value) {
    updateData.value = payload.value;
  }

  const result = await repos.flagVariationsRepository.updateById(id, updateData);

  await repos.logsRepository.create({
    action: ActionType.Edit,
    actorId,
    applicationId: featureFlag.applicationId,
    newData: updateData,
    oldData: { key: variation.key, value: variation.value },
    subjectId: result.id,
    subjectKey: result.key,
    subjectType: SubjectType.Variation,
  });

  return result;
}

async function deleteVariationInTx(repos: Repositories, id: string, actorId: string) {
  const variation = await repos.flagVariationsRepository.getById(id);
  const featureFlag = await repos.featureFlagsRepository.getById(variation.flagId);
  const [variationInUseForFlagEnvironments, variationInUseForRules] = await Promise.all([
    repos.flagEnvironmentsRepository.exists({ defaultServeIds: [id] }),
    repos.rulesRepository.exists({ serveIds: [id] }),
  ]);

  if (variationInUseForFlagEnvironments) {
    throw new UnprocessableError({
      message: `Variation '${variation.key}' is currently being used as the default variation for this flag`,
      detail: 'This variation is the default for a flag environment and cannot be deleted.',
      context: { variationId: id, flagId: variation.flagId },
    });
  }

  if (variationInUseForRules) {
    throw new UnprocessableError({
      message: `Variation '${variation.key}' is currently being used in a rule for this flag`,
      detail: 'This variation is used by a rule and cannot be deleted.',
      context: { variationId: id, flagId: variation.flagId },
    });
  }

  const result = await repos.flagVariationsRepository.softDeleteById(id);
  await repos.logsRepository.create({
    action: ActionType.Delete,
    actorId,
    applicationId: featureFlag.applicationId,
    newData: null,
    oldData: { key: variation.key, value: variation.value },
    subjectId: result.id,
    subjectKey: result.key,
    subjectType: SubjectType.Variation,
  });

  return result;
}

export default createVariationsService;

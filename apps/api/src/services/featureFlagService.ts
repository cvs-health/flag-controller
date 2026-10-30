// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { Actor, EnvironmentKey, FeatureFlagType, FeatureFlagVariation } from 'shared-types';
import { ActionType, FieldErrorCode, SubjectType } from 'shared-types';

import type {
  FeatureFlagsListFilters,
  FeatureFlagsJoined,
  FeatureFlagsUpdate,
} from 'repositories/featureFlagsRepository.js';
import buildListResult from 'utils/buildListResult.js';
import type { FlagEnvironmentsService } from 'services/flagEnvironmentsService.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import validateVariationValuesByFeatureFlagType from 'utils/validateVariationValuesByFeatureFlagType.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';

export type FeatureFlagService = ReturnType<typeof createFeatureFlagService>;
type FeatureFlagWithEnvironments = FeatureFlagsJoined & {
  enabled: Record<string, boolean>;
};
interface ListFeatureFlagsFilters extends FeatureFlagsListFilters {
  enabled?: boolean;
  environmentKeys?: EnvironmentKey[];
}

interface FeatureFlagServiceDependencies extends ServiceDependencies {
  flagEnvironmentsService: FlagEnvironmentsService;
}

export interface CreateFeatureFlagPayload {
  actor: Actor;
  applicationId: string;
  defaultVariationKey: string;
  description: string;
  enabled: boolean;
  key: string;
  type: FeatureFlagType;
  variations: FeatureFlagVariation<FeatureFlagType>;
}

function createFeatureFlagService({
  repositories,
  withTransaction,
  flagEnvironmentsService,
  assertCanWrite,
}: FeatureFlagServiceDependencies) {
  if (!withTransaction) {
    throw new Error('featureFlagService requires withTransaction');
  }

  type FeatureFlagListResult<T> = ReturnType<typeof buildListResult<T>>;

  function listFeatureFlags(
    params: ServiceListParams<FeatureFlagsJoined, ListFeatureFlagsFilters, { environments: true }>,
  ): Promise<FeatureFlagListResult<FeatureFlagWithEnvironments>>;
  function listFeatureFlags(
    params: ServiceListParams<FeatureFlagsJoined, ListFeatureFlagsFilters, { environments?: false }>,
  ): Promise<FeatureFlagListResult<FeatureFlagsJoined>>;
  async function listFeatureFlags(
    params: ServiceListParams<FeatureFlagsJoined, ListFeatureFlagsFilters, { environments?: boolean }>,
  ) {
    const { filters: paramsFilters = {}, pagination, sort } = params;
    const { enabled, environmentKeys, ...filters } = paramsFilters;
    const offset = (pagination.page - 1) * pagination.rows;
    const featureFlagEnvironmentsByFlagId = new Map<string, Record<string, boolean>>();
    let listFilters: FeatureFlagsListFilters = filters;

    if (params.with?.environments || enabled !== undefined || environmentKeys?.length) {
      const featureFlagEnvironments = await repositories.flagEnvironmentsRepository.list({
        filters: {
          flagIds: paramsFilters?.flagIds,
          enabled,
          environmentKeys,
        },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });

      for (const environment of featureFlagEnvironments) {
        featureFlagEnvironmentsByFlagId.set(environment.flagId, {
          ...(featureFlagEnvironmentsByFlagId.get(environment.flagId) ?? {}),
          [environment.environmentKey]: environment.enabled,
        });
      }

      if (environmentKeys?.length) {
        const filteredFlagIds = Array.from(featureFlagEnvironmentsByFlagId.keys());

        if (filteredFlagIds.length === 0) {
          return buildListResult([], 0, pagination);
        }

        listFilters = {
          ...filters,
          flagIds: filteredFlagIds,
        };
      }
    }

    const [data, totalRecords] = await Promise.all([
      repositories.featureFlagsRepository.list({
        filters: listFilters,
        pagination: { limit: pagination.rows, offset },
        sort,
      }),
      repositories.featureFlagsRepository.count(listFilters),
    ]);

    if (params.with?.environments) {
      const featureFlagsWithEnvironments: FeatureFlagWithEnvironments[] = data.map((flag) => ({
        ...flag,
        enabled: featureFlagEnvironmentsByFlagId.get(flag.id) ?? {},
      }));

      return buildListResult(featureFlagsWithEnvironments, totalRecords, pagination);
    }

    return buildListResult(data, totalRecords, pagination);
  }

  return {
    createFeatureFlag: async (payload: CreateFeatureFlagPayload) => {
      await assertCanWrite(payload.actor.id, 'application', payload.applicationId);

      if (Object.keys(payload.variations).length === 0) {
        throw new ValidationError({
          message: 'variations must be an object with at least one key',
          detail: 'At least one variation is required.',
          errors: [{ field: 'variations', code: FieldErrorCode.TooShort }],
        });
      }

      validateVariationValuesByFeatureFlagType(payload.type, payload.variations);

      if (!(payload.defaultVariationKey in payload.variations)) {
        throw new ValidationError({
          message: 'defaultVariationKey must exist in variations',
          detail: 'The default variation must be one of the provided variations.',
          errors: [{ field: 'defaultVariationKey', code: FieldErrorCode.Invalid }],
        });
      }

      const application = await repositories.applicationsRepository.findById(payload.applicationId);

      if (!application) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { applicationId: payload.applicationId },
        });
      }

      return withTransaction(async (repos) => {
        const flag = await repos.featureFlagsRepository.create({
          applicationId: payload.applicationId,
          description: payload.description,
          key: payload.key,
          type: payload.type,
        });

        const variations = await Promise.all(
          Object.entries(payload.variations).map(([key, value]) =>
            repos.flagVariationsRepository.create({ flagId: flag.id, key, value }),
          ),
        );

        const defaultServeId = variations.find((variation) => variation.key === payload.defaultVariationKey)?.id;

        if (!defaultServeId) {
          throw new ValidationError({
            message: 'defaultVariationKey did not resolve to a variation',
            detail: 'The default variation must be one of the provided variations.',
            errors: [{ field: 'defaultVariationKey', code: FieldErrorCode.Invalid }],
          });
        }

        const flagEnvironments = await flagEnvironmentsService.provisionForFlag(
          { applicationId: payload.applicationId, flagId: flag.id, defaultServeId, enabled: payload.enabled },
          repos,
        );

        const baseLogEntry = {
          action: ActionType.Create,
          actorId: payload.actor.id,
          applicationId: flag.applicationId,
          oldData: null,
        };
        const variationLogEntries = variations.map((variation) => ({
          ...baseLogEntry,
          subjectId: variation.id,
          subjectKey: variation.key,
          subjectType: SubjectType.Variation,
          newData: variation,
        }));
        const flagLogEntry = {
          ...baseLogEntry,
          subjectId: flag.id,
          subjectKey: flag.key,
          subjectType: SubjectType.FeatureFlag,
          newData: flag,
        };
        const flagEnvironmentsLogEntries = flagEnvironments.map((flagEnvironment) => ({
          ...baseLogEntry,
          environmentId: flagEnvironment.environmentId,
          subjectId: flag.id,
          subjectKey: flag.key,
          subjectType: SubjectType.FeatureFlagEnvironment,
          newData: flagEnvironment,
        }));

        await Promise.all(
          [...variationLogEntries, flagLogEntry, ...flagEnvironmentsLogEntries].map((logEntry) =>
            repos.logsRepository.create(logEntry),
          ),
        );

        return flag;
      });
    },

    listFeatureFlags,

    countFeatureFlags: async (filters?: FeatureFlagsListFilters) => {
      return repositories.featureFlagsRepository.count(filters);
    },

    getFeatureFlagById: async (featureFlagId: string) => {
      const flag = await repositories.featureFlagsRepository.getById(featureFlagId);

      return flag;
    },

    getFeatureFlagByApplicationNameAndKey: async (applicationName: string, featureFlagKey: string) => {
      const featureFlag = await repositories.featureFlagsRepository.getByApplicationNameAndKey(
        applicationName,
        featureFlagKey,
      );

      return featureFlag;
    },

    updateFeatureFlag: async (flagId: string, payload: FeatureFlagsUpdate, userId: string) => {
      await assertCanWrite(userId, 'featureFlag', flagId);

      const featureFlag = await repositories.featureFlagsRepository.getById(flagId);

      return withTransaction(async (repos) => {
        const updatedFlag = await repos.featureFlagsRepository.updateById(flagId, payload);
        let action = ActionType.Edit;

        if (featureFlag.archived && !updatedFlag.archived) {
          action = ActionType.Restore;
        } else if (!featureFlag.archived && updatedFlag.archived) {
          action = ActionType.Archive;
          const enabledFlagEnvironments = await repos.flagEnvironmentsRepository.list({
            filters: { enabled: true, flagIds: [flagId] },
            pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
          });
          await repos.flagEnvironmentsRepository.updateMany(
            enabledFlagEnvironments.map(({ environmentId }) => ({ flagId, environmentId, enabled: false })),
          );
        }

        const featureFlagLogEntry = {
          action,
          actorId: userId,
          applicationId: updatedFlag.applicationId,
          oldData: featureFlag,
          subjectId: updatedFlag.id,
          subjectKey: updatedFlag.key,
          subjectType: SubjectType.FeatureFlag,
          newData: updatedFlag,
        };

        await repos.logsRepository.create(featureFlagLogEntry);

        return updatedFlag;
      });
    },
  };
}

export default createFeatureFlagService;

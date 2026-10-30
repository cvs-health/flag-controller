// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, FieldErrorCode, SubjectType } from 'shared-types';

import type {
  FlagEnvironmentsCreate,
  FlagEnvironmentsJoined,
  FlagEnvironmentsListFilters,
  FlagEnvironmentsUpdate,
} from 'repositories/flagEnvironmentsRepository.js';
import buildListResult from 'utils/buildListResult.js';
import listParamsSortToString from 'utils/listParamsSortToString.js';
import type { Repositories } from 'utils/createRepositories.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';
import { UnprocessableError } from '../errors/AppError.js';

export type FlagEnvironmentsService = ReturnType<typeof createFlagEnvironmentsService>;

function createFlagEnvironmentsService({ repositories, withTransaction, assertCanWrite }: ServiceDependencies) {
  if (!withTransaction) {
    throw new Error('flagEnvironmentsService requires withTransaction');
  }
  const service = {
    createFlagEnvironment: async (payload: FlagEnvironmentsCreate, userId: string) => {
      await assertCanWrite(userId, 'featureFlag', payload.flagId);

      return repositories.flagEnvironmentsRepository.create(payload);
    },

    provisionForFlag: async (
      input: { applicationId: string; flagId: string; defaultServeId: string; enabled: boolean },
      repos: Repositories = repositories,
    ) => {
      const environments = await repos.environmentsRepository.list({
        filters: { applicationId: input.applicationId },
        pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
      });

      return repos.flagEnvironmentsRepository.createMany(
        environments.map((environment) => ({
          defaultServeId: input.defaultServeId,
          enabled: input.enabled,
          environmentId: environment.id,
          flagId: input.flagId,
        })),
      );
    },

    findFlagEnvironment: async (flagId: string, environmentId: string) => {
      return repositories.flagEnvironmentsRepository.findByFlagIdAndEnvironmentId(flagId, environmentId);
    },

    getFlagEnvironment: async (flagId: string, environmentId: string) => {
      return repositories.flagEnvironmentsRepository.getByFlagIdAndEnvironmentId(flagId, environmentId);
    },

    updateFlagEnvironment: async (
      flagId: string,
      environmentId: string,
      payload: FlagEnvironmentsUpdate,
      userId: string,
    ) => {
      await assertCanWrite(userId, 'featureFlag', flagId);

      if (payload.defaultServeId !== undefined) {
        const variation = await repositories.flagVariationsRepository.findById(payload.defaultServeId);

        if (!variation) {
          throw new UnprocessableError({
            message: 'defaultServeId does not reference an existing variation',
            detail: 'The default variation does not exist.',
            errors: [{ field: 'defaultServeId', code: FieldErrorCode.NotFound }],
            context: { defaultServeId: payload.defaultServeId, flagId },
          });
        }

        if (variation.flagId !== flagId) {
          throw new UnprocessableError({
            message: 'defaultServeId must be a variation of this feature flag',
            detail: 'The default variation must belong to this feature flag.',
            errors: [{ field: 'defaultServeId', code: FieldErrorCode.Invalid }],
            context: { defaultServeId: payload.defaultServeId, flagId, variationFlagId: variation.flagId },
          });
        }
      }

      const flagEnvironment = await service.getFlagEnvironment(flagId, environmentId);

      return withTransaction(async (repos) => {
        const updatedFlagEnvironment = await repos.flagEnvironmentsRepository.updateByFlagIdAndEnvironmentId(
          flagId,
          environmentId,
          payload,
        );
        const oldData = {
          defaultServeId: flagEnvironment.defaultServeId,
          defaultServeKey: flagEnvironment.defaultServeKey,
          enabled: flagEnvironment.enabled,
        };
        const newData = {
          defaultServeId: updatedFlagEnvironment.defaultServeId,
          defaultServeKey: updatedFlagEnvironment.defaultServeKey,
          enabled: updatedFlagEnvironment.enabled,
        };
        let action = ActionType.Edit;

        if (flagEnvironment.enabled && !updatedFlagEnvironment.enabled) {
          action = ActionType.Disable;
        } else if (!flagEnvironment.enabled && updatedFlagEnvironment.enabled) {
          action = ActionType.Enable;
        }

        await repos.logsRepository.create({
          action,
          actorId: userId,
          applicationId: flagEnvironment.flag.applicationId,
          environmentId,
          newData,
          oldData,
          subjectId: flagId,
          subjectKey: flagEnvironment.flag.key,
          subjectType: SubjectType.FeatureFlagEnvironment,
        });
        return updatedFlagEnvironment;
      });
    },

    listFlagEnvironments: async (params: ServiceListParams<FlagEnvironmentsJoined, FlagEnvironmentsListFilters>) => {
      const { filters, pagination, sort } = params;
      const offset = (pagination.page - 1) * pagination.rows;

      const [data, totalRecords] = await Promise.all([
        repositories.flagEnvironmentsRepository.list({
          filters,
          pagination: { limit: pagination.rows, offset },
          sort,
        }),
        repositories.flagEnvironmentsRepository.count(filters),
      ]);

      return buildListResult(data, totalRecords, pagination, {
        sort: listParamsSortToString(sort.field, sort.direction),
      });
    },
  };

  return service;
}

export default createFlagEnvironmentsService;

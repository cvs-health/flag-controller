// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey } from 'shared-types';

import type { EnvironmentFilters, EnvironmentInsert } from 'repositories/environmentsRepository.js';
import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import type { environments } from 'db/schema/environments.js';
import { NotFoundError } from '../errors/AppError.js';

export type EnvironmentsService = ReturnType<typeof createEnvironmentsService>;

function createEnvironmentsService({ repositories, assertCanWrite }: ServiceDependencies) {
  return {
    createEnvironment: async (payload: EnvironmentInsert, actorId: string) => {
      await assertCanWrite(actorId, 'application', payload.applicationId);

      return repositories.environmentsRepository.create(payload);
    },

    findEnvironmentById: async (id: string) => {
      return repositories.environmentsRepository.findById(id);
    },

    getEnvironmentById: async (id: string) => {
      return repositories.environmentsRepository.getById(id);
    },

    findEnvironmentByKey: async (applicationId: string, key: EnvironmentKey) => {
      return repositories.environmentsRepository.findByKey(applicationId, key);
    },

    getEnvironmentByKey: async (applicationId: string, key: EnvironmentKey) => {
      return repositories.environmentsRepository.getByKey(applicationId, key);
    },

    listEnvironments: async (params: ServiceListParams<typeof environments.$inferSelect, EnvironmentFilters>) => {
      const { filters, pagination, sort } = params;
      const offset = (pagination.page - 1) * pagination.rows;

      const [data, total] = await Promise.all([
        repositories.environmentsRepository.list({
          filters,
          pagination: { limit: pagination.rows, offset },
          sort,
        }),
        repositories.environmentsRepository.count(filters),
      ]);

      return {
        data,
        metadata: {
          page: pagination.page,
          records: data.length,
          rows: pagination.rows,
          totalPages: pagination.rows > 0 ? Math.ceil(total / pagination.rows) : 0,
          totalRecords: total,
        },
      };
    },

    updateEnvironment: async (id: string, payload: Partial<EnvironmentInsert>, actorId: string) => {
      await assertCanWrite(actorId, 'environment', id);

      const environment = await repositories.environmentsRepository.updateById(id, payload);
      if (!environment) {
        throw new NotFoundError({
          message: 'Environment not found',
          detail: 'Environment not found.',
          context: { id },
        });
      }
      return environment;
    },

    deleteEnvironment: async (id: string, actorId: string) => {
      await assertCanWrite(actorId, 'environment', id);

      const result = await repositories.environmentsRepository.hardDeleteById(id);
      if (!result) {
        throw new NotFoundError({
          message: 'Environment not found',
          detail: 'Environment not found.',
          context: { id },
        });
      }
    },
  };
}

export default createEnvironmentsService;

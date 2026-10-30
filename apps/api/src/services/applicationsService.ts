// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { listById } from 'shared-utils';
import { ActionType, EnvironmentKey, FieldErrorCode, SubjectType } from 'shared-types';

import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import type { With } from '../types/common.js';
import type { applications } from 'db/schema/applications.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';
import { PAGINATION_NO_LIMIT } from '../constants/pagination.js';

export type ApplicationSelect = typeof applications.$inferSelect;
export type ApplicationInsert = Omit<typeof applications.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type ApplicationsService = ReturnType<typeof createApplicationsService>;

interface ListApplicationsWith extends With {
  teams: boolean;
}

interface ListApplicationFilters {
  teamIds?: string[];
}

function createApplicationsService({ repositories, withTransaction, assertCanWrite }: ServiceDependencies) {
  return {
    listApplications: async (
      params: ServiceListParams<typeof applications.$inferSelect, ListApplicationFilters, ListApplicationsWith>,
    ) => {
      const [applicationsResult, countResult] = await Promise.all([
        repositories.applicationsRepository.list({
          filters: {
            teamIds: params.filters?.teamIds,
          },
          pagination: {
            limit: params.pagination.rows,
            offset: (params.pagination.page - 1) * params.pagination.rows,
          },
          sort: {
            direction: params.sort.direction,
            field: params.sort.field,
          },
        }),
        repositories.applicationsRepository.count({ teamIds: params.filters?.teamIds }),
      ]);
      const baseResponse = {
        data: [],
        metadata: {
          page: params.pagination.page,
          records: applicationsResult.length,
          rows: params.pagination.rows,
          totalPages: params.pagination.rows > 0 ? Math.ceil(countResult / params.pagination.rows) : 0,
          totalRecords: countResult,
        },
      };

      if (!applicationsResult.length) {
        return baseResponse;
      }

      if (params.with?.teams) {
        const applicationIds = applicationsResult.map((app) => app.teamId);
        const teams = await repositories.teamsRepository.list({
          filters: { applicationIds: applicationIds },
          pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 },
        });
        const teamsById = listById(teams);
        const data = applicationsResult.map((application) => ({
          ...application,
          team: teamsById[application.teamId],
        }));

        return {
          ...baseResponse,
          data,
        };
      }

      return {
        ...baseResponse,
        data: applicationsResult,
      };
    },
    createApplication: async (payload: ApplicationInsert, actorId: string) => {
      await assertCanWrite(actorId, 'team', payload.teamId);

      const existing = await repositories.applicationsRepository.findByName(payload.name);

      if (existing) {
        throw new ConflictError({
          message: 'Application with this name already exists',
          detail: 'An application with this name already exists.',
          errors: [{ field: 'name', code: FieldErrorCode.Duplicate }],
          context: { name: payload.name },
        });
      }

      return withTransaction(async (repos) => {
        const application = await repos.applicationsRepository.create(payload);
        await repos.environmentsRepository.createMany([
          {
            applicationId: application.id,
            key: EnvironmentKey.Development,
          },
          {
            applicationId: application.id,
            key: EnvironmentKey.Production,
          },
        ]);
        await repos.logsRepository.create({
          action: ActionType.Create,
          actorId,
          applicationId: application.id,
          newData: application,
          oldData: null,
          subjectId: application.id,
          subjectKey: application.name,
          subjectType: SubjectType.Application,
        });

        return application;
      });
    },

    findById: async (id: string) => {
      const application = await repositories.applicationsRepository.findById(id);

      if (!application) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { id },
        });
      }

      return application;
    },

    getApplicationByName: async (name: string) => {
      const application = await repositories.applicationsRepository.getByName(name);

      return application;
    },

    updateApplication: async (id: string, payload: Partial<ApplicationInsert>, actorId: string) => {
      await assertCanWrite(actorId, 'application', id);

      const existingApplication = await repositories.applicationsRepository.findById(id);

      return withTransaction(async (repos) => {
        const application = await repos.applicationsRepository.updateById(id, payload);

        if (!application) {
          throw new NotFoundError({
            message: 'Application not found',
            detail: 'Application not found.',
            context: { id },
          });
        }

        await repos.logsRepository.create({
          action: ActionType.Edit,
          actorId,
          applicationId: application.id,
          newData: application,
          oldData: existingApplication,
          subjectId: application.id,
          subjectKey: application.name,
          subjectType: SubjectType.Application,
        });

        return application;
      });
    },

    deleteApplication: async (applicationId: string, actorId: string) => {
      await assertCanWrite(actorId, 'application', applicationId);

      const existingApplication = await repositories.applicationsRepository.findById(applicationId);

      if (!existingApplication) {
        throw new NotFoundError({
          message: 'Application not found',
          detail: 'Application not found.',
          context: { id: applicationId },
        });
      }

      return withTransaction(async (repos) => {
        const environments = await repos.environmentsRepository.list({
          filters: { applicationId },
          pagination: {
            offset: 0,
            limit: PAGINATION_NO_LIMIT,
          },
        });
        const featureFlags =
          (await repos.featureFlagsRepository.list({
            filters: { applicationIds: [applicationId], include: { archived: true } },
            pagination: {
              offset: 0,
              limit: PAGINATION_NO_LIMIT,
            },
          })) ?? [];
        const segments =
          (await repos.segmentsRepository.list({
            filters: { applicationIds: [applicationId] },
            pagination: {
              offset: 0,
              limit: PAGINATION_NO_LIMIT,
            },
          })) ?? [];
        const rules = environments.length
          ? await repos.rulesRepository.list({
              filters: { environmentIds: environments.map((environment) => environment.id) },
              pagination: {
                offset: 0,
                limit: PAGINATION_NO_LIMIT,
              },
            })
          : [];
        const deletedFeatureFlags = await repos.featureFlagsRepository.softDeleteMany(
          featureFlags.map((flag) => flag.id),
        );
        const deletedRules = await repos.rulesRepository.softDeleteMany(rules.map((rule) => rule.id));
        const deletedSegments = await repos.segmentsRepository.softDeleteMany(segments.map((segment) => segment.id));
        const application = await repos.applicationsRepository.softDeleteById(applicationId);
        const featureFlagLogs = deletedFeatureFlags.map((flag) => ({
          action: ActionType.Delete,
          actorId,
          applicationId,
          newData: null,
          oldData: flag,
          subjectId: flag.id,
          subjectKey: flag.key,
          subjectType: SubjectType.FeatureFlag,
        }));
        const ruleLogs = deletedRules.map((rule) => ({
          action: ActionType.Delete,
          actorId,
          applicationId,
          environmentId: rule.environmentId,
          newData: null,
          oldData: rule,
          subjectId: rule.id,
          subjectKey: rule.key,
          subjectType: SubjectType.Rule,
        }));
        const segmentLogs = deletedSegments.map((segment) => ({
          action: ActionType.Delete,
          actorId,
          applicationId,
          newData: null,
          oldData: segment,
          subjectId: segment.id,
          subjectKey: segment.key,
          subjectType: SubjectType.Segment,
        }));

        await repos.logsRepository.createMany([
          ...featureFlagLogs,
          ...ruleLogs,
          ...segmentLogs,
          {
            action: ActionType.Delete,
            actorId,
            applicationId,
            newData: null,
            oldData: existingApplication,
            subjectId: existingApplication.id,
            subjectKey: existingApplication.name,
            subjectType: SubjectType.Application,
          },
        ]);

        return application;
      });
    },
  };
}

export default createApplicationsService;

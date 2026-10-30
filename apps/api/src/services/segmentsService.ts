// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { segments } from 'db/schema/segments.js';
import type {
  SegmentsCreate,
  SegmentsFilters,
  SegmentsListWith,
  SegmentsUpdate,
} from 'repositories/segmentsRepository.js';
import listParamsSortToString from 'utils/listParamsSortToString.js';
import buildListResult from 'utils/buildListResult.js';

import type { ServiceDependencies, ServiceListParams } from '../types/services.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';
import { ActionType, FieldErrorCode, SubjectType } from 'shared-types';

export type SegmentsService = ReturnType<typeof createSegmentsService>;

function createSegmentsService({ repositories, withTransaction, assertCanWrite }: ServiceDependencies) {
  async function listSegments(
    params: ServiceListParams<typeof segments.$inferSelect, SegmentsFilters, SegmentsListWith>,
  ) {
    const sort = listParamsSortToString(params.sort.field, params.sort.direction);
    const [segmentsResult, countResult] = await Promise.all([
      repositories.segmentsRepository.list({
        filters: params.filters,
        pagination: {
          limit: params.pagination.rows,
          offset: (params.pagination.page - 1) * params.pagination.rows,
        },
        sort: params.sort,
        with: params.with,
      }),
      repositories.segmentsRepository.count({
        filters: params.filters,
      }),
    ]);

    return buildListResult(segmentsResult, countResult, params.pagination, {
      search: params.filters?.search,
      sort,
    });
  }

  return {
    createSegment: async (payload: SegmentsCreate, actorId: string) => {
      await assertCanWrite(actorId, 'application', payload.applicationId);

      const existing = await repositories.segmentsRepository.findByKey(payload.applicationId, payload.key);

      if (existing) {
        throw new ConflictError({
          message: 'Segment with this key already exists',
          detail: 'A segment with this key already exists for this application.',
          errors: [{ field: 'key', code: FieldErrorCode.Duplicate }],
          context: { applicationId: payload.applicationId, key: payload.key },
        });
      }

      return withTransaction(async (repos) => {
        const segment = await repos.segmentsRepository.create(payload);
        await repos.logsRepository.create({
          action: ActionType.Create,
          actorId,
          applicationId: segment.applicationId,
          subjectId: segment.id,
          subjectKey: segment.key,
          subjectType: SubjectType.Segment,
          newData: segment,
          oldData: null,
        });

        return segment;
      });
    },
    createManySegments: async (payload: SegmentsCreate[], actorId: string) => {
      await assertCanWrite(
        actorId,
        'application',
        payload.map((segment) => segment.applicationId),
      );

      const existingSegments = await Promise.all(
        payload.map((segment) => repositories.segmentsRepository.findByKey(segment.applicationId, segment.key)),
      );

      const existingSegmentKeys = existingSegments.reduce<string[]>((existingKeys, segment) => {
        if (segment) {
          existingKeys.push(segment.key);
        }

        return existingKeys;
      }, []);

      if (existingSegmentKeys.length) {
        throw new ConflictError({
          message: `Segments with these keys already exist: ${existingSegmentKeys.join(', ')}`,
          detail: `Segments with these keys already exist: ${existingSegmentKeys.join(', ')}.`,
          errors: existingSegmentKeys.map(() => ({ field: 'key', code: FieldErrorCode.Duplicate })),
          context: { keys: existingSegmentKeys },
        });
      }

      return withTransaction(async (repos) => {
        const segments = await repos.segmentsRepository.createMany(payload);
        const baseLogEntry = {
          action: ActionType.Create,
          actorId,
          oldData: null,
        };

        const logEntries = segments.map((segment) => ({
          ...baseLogEntry,
          applicationId: segment.applicationId,
          subjectId: segment.id,
          subjectKey: segment.key,
          subjectType: SubjectType.Segment,
          newData: segment,
        }));

        await Promise.all(logEntries.map((logEntry) => repos.logsRepository.create(logEntry)));

        return segments;
      });
    },
    listSegments,
    findSegmentById: async (id: string) => {
      const segment = await repositories.segmentsRepository.findById(id);

      return segment;
    },
    getSegmentById: async (id: string) => {
      const segment = await repositories.segmentsRepository.getById(id);

      return segment;
    },
    getSegmentByApplicationNameAndKey: async (applicationName: string, segmentKey: string) => {
      const segment = await repositories.segmentsRepository.getByApplicationNameAndKey(applicationName, segmentKey);

      return segment;
    },
    findSegmentByKey: async (applicationId: string, segmentKey: string) => {
      const segment = await repositories.segmentsRepository.findByKey(applicationId, segmentKey);

      return segment;
    },
    updateSegment: async (id: string, payload: SegmentsUpdate, actorId: string) => {
      await assertCanWrite(actorId, 'segment', id);

      const existingSegment = await repositories.segmentsRepository.findById(id);

      return withTransaction(async (repos) => {
        const segment = await repos.segmentsRepository.updateById(id, payload);

        if (!segment) {
          throw new NotFoundError({ message: 'Segment not found', detail: 'Segment not found.', context: { id } });
        }

        await repos.logsRepository.create({
          action: ActionType.Edit,
          actorId,
          applicationId: segment.applicationId,
          subjectId: segment.id,
          subjectKey: segment.key,
          subjectType: SubjectType.Segment,
          newData: segment,
          oldData: existingSegment,
        });

        return segment;
      });
    },
  };
}

export default createSegmentsService;

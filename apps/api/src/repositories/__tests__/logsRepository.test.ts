// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, SubjectType } from 'shared-types';
import { and, gte, ilike, inArray, lte, or } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import createLogsRepository, { type LogInsert } from 'repositories/logsRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { LogsRepository } from '../logsRepository.js';
import { logs } from 'db/schema/logs.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';

describe('logsRepository', () => {
  let logsRepository: LogsRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    logsRepository = createLogsRepository(db);
  });

  describe('create', () => {
    it('handles a successful create', async () => {
      const payload = {
        action: ActionType.Edit,
        actorId: 'actor-id',
        applicationId: 'app',
        subjectId: 'variation-id',
        subjectKey: 'flag',
        subjectType: SubjectType.Variation,
        oldData: {},
        newData: {},
      };

      const log = {
        ...payload,
        id: 'log-1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        environmentId: null,
      };

      methods.returning.mockResolvedValueOnce([log]);

      const result = await logsRepository.create(payload);

      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(log);
    });
  });

  describe('createMany', () => {
    it('creates multiple logs', async () => {
      const entries = [
        {
          action: ActionType.Edit,
          actorId: 'actor-id',
          applicationId: 'app',
          subjectId: 'variation-id',
          subjectKey: 'flag',
          subjectType: SubjectType.Variation,
          oldData: {},
          newData: {},
        } as LogInsert,
      ];

      await logsRepository.createMany(entries);
      expect(methods.values).toHaveBeenCalledWith(entries);
    });

    it('returns empty array when no logs', async () => {
      const result = await logsRepository.createMany([]);
      expect(result).toEqual([]);
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const subjectIds = ['variation-id'];
      const subjectKeys = ['flag-key'];
      const subjectTypes = [SubjectType.Variation];
      const environmentIds = ['env-1'];
      const actionTypes = [ActionType.Edit];
      const actionStartDate = '2024-01-01T00:00:00.000Z';
      const actionEndDate = '2024-12-31T23:59:59.999Z';
      const search = 'search-term';

      await logsRepository.list({
        filters: {
          and: {
            applicationIds,
            subjectIds,
            subjectKeys,
            subjectTypes,
            environmentIds,
            actionTypes,
            actionStartDate,
            actionEndDate,
          },
          or: [{ search }],
        },
        pagination: { limit: 10, offset: 20 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(logs.applicationId, applicationIds),
          inArray(logs.subjectId, subjectIds),
          inArray(logs.subjectKey, subjectKeys),
          inArray(logs.subjectType, subjectTypes),
          inArray(logs.environmentId, environmentIds),
          gte(logs.createdAt, new Date(actionStartDate)),
          lte(logs.createdAt, new Date(actionEndDate)),
          inArray(logs.action, actionTypes),
          or(and(ilike(logs.subjectKey, `%${search}%`))),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params', async () => {
      await logsRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and());
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('uses the same combined application and team scope for totals', async () => {
      await logsRepository.count({
        or: [{ applicationIds: ['app-1'] }, { subjectTypes: [SubjectType.Team], subjectIds: ['team-1'] }],
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          or(
            and(inArray(logs.applicationId, ['app-1'])),
            and(inArray(logs.subjectId, ['team-1']), inArray(logs.subjectType, [SubjectType.Team])),
          ),
        ),
      );
    });

    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const actionTypes = [ActionType.Edit];

      await logsRepository.count({ and: { applicationIds, actionTypes } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(inArray(logs.applicationId, applicationIds), inArray(logs.action, actionTypes)),
      );
    });

    it('fetches based on unavailable params', async () => {
      await logsRepository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and());
    });
  });

  describe('countDistinct', () => {
    it('fetches based on available params', async () => {
      const applicationIds = ['app-1'];
      const subjectTypes = [SubjectType.Variation];

      await logsRepository.countDistinct(logs.actorId, { and: { applicationIds, subjectTypes } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(inArray(logs.applicationId, applicationIds), inArray(logs.subjectType, subjectTypes)),
      );
    });

    it('fetches based on unavailable params', async () => {
      await logsRepository.countDistinct(logs.actorId);

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and());
    });
  });
});

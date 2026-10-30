// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import createRulesRepository from 'repositories/rulesRepository.js';
import mockDb, { type MockMethods } from 'test/mockDb.js';
import type { DbOrTx } from '../../types/db.js';
import type { RulesRepository } from '../rulesRepository.js';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import { InternalError, NotFoundError } from '../../errors/AppError.js';
import { rules } from 'db/schema/rules.js';

describe('rulesRepository', () => {
  let rulesRepository: RulesRepository;
  let db: DbOrTx;
  let methods: MockMethods;

  beforeEach(() => {
    vi.clearAllMocks();
    [db, methods] = mockDb();
    rulesRepository = createRulesRepository(db);
  });

  describe('findOwningTeamId', () => {
    it('returns the id of the team that owns the entity', async () => {
      methods.limit.mockResolvedValue([{ teamId: 'team-1' }]);

      const result = await rulesRepository.findOwningTeamId('rule-1');

      expect(result).toBe('team-1');
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(rules.id, 'rule-1'));
    });

    it('returns null when the id resolves to no team', async () => {
      methods.limit.mockResolvedValue([]);

      expect(await rulesRepository.findOwningTeamId('ghost')).toBeNull();
    });
  });

  describe('createMany', () => {
    it('handle empty payload', async () => {
      const result = await rulesRepository.createMany([]);

      expect(result).toEqual([]);
      expect(methods.values).not.toHaveBeenCalled();
    });

    it('creates multiple rules', async () => {
      const rule = {
        conditions: [],
        environmentId: 'environment-id',
        flagId: 'flag-id',
        key: 'rule-key',
        orderPosition: 1,
        serveFractionalId: null,
        serveVariationId: 'variation-id',
      };

      methods.returning.mockResolvedValueOnce([rule]);
      methods.limit.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.createMany([rule]);

      expect(result).toEqual([rule]);
      expect(methods.values).toHaveBeenCalledExactlyOnceWith(rule);
    });
  });

  describe('updateMany', () => {
    it('handle empty payload', async () => {
      const result = await rulesRepository.updateMany([]);

      expect(result).toEqual([]);
      expect(methods.values).not.toHaveBeenCalled();
    });

    it('updates multiple rules', async () => {
      const id = 'rule-id';
      const rule = {
        conditions: [],
        environmentId: 'environment-id',
        flagId: 'flag-id',
        orderPosition: 1,
      };
      const ruleWithId = { ...rule, id };

      methods.returning.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.updateMany([ruleWithId]);

      expect(result).toEqual([rule]);
      expect(methods.set).toHaveBeenCalledExactlyOnceWith(rule);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(rules.id, id));
    });
  });

  describe('hardDeleteMany', () => {
    it('handle empty payload', async () => {
      const result = await rulesRepository.hardDeleteMany([]);

      expect(result).toEqual([]);
    });

    it('reads the joined rows with a lock, then deletes them', async () => {
      const ruleId = 'rule-id';
      await rulesRepository.hardDeleteMany([ruleId]);

      expect(methods.for).toHaveBeenCalledExactlyOnceWith('update', { of: rules });
      // Once to read the joined rows before they go, once for the delete itself.
      expect(methods.where).toHaveBeenCalledTimes(2);
      expect(methods.where).toHaveBeenNthCalledWith(1, inArray(rules.id, [ruleId]));
      expect(methods.where).toHaveBeenNthCalledWith(2, inArray(rules.id, [ruleId]));
    });
  });

  describe('list', () => {
    it('fetches based on available params', async () => {
      const flagIds = ['flag-id'];
      const segmentIds = ['segment-id'];
      const serveIds = ['serve-id'];

      await rulesRepository.list({
        filters: { include: { deleted: true }, flagIds, segmentIds, serveIds },
        pagination: { limit: 10, offset: 20 },
      });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(rules.flagId, flagIds),
          inArray(rules.segmentId, segmentIds),
          or(inArray(rules.serveFractionalId, serveIds), inArray(rules.serveVariationId, serveIds)),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(10);
      expect(methods.offset).toHaveBeenCalledExactlyOnceWith(20);
    });

    it('fetches based on unavailable params', async () => {
      await rulesRepository.list({ pagination: { limit: PAGINATION_NO_LIMIT, offset: 0 } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(rules.deletedAt)));
      expect(methods.limit).not.toHaveBeenCalled();
      expect(methods.offset).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('fetches based on available params', async () => {
      const flagIds = ['flag-id'];
      const segmentIds = ['segment-id'];
      const serveIds = ['serve-id'];

      await rulesRepository.count({ flagIds, segmentIds, serveIds, include: { deleted: true } });

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(rules.flagId, flagIds),
          inArray(rules.segmentId, segmentIds),
          or(inArray(rules.serveFractionalId, serveIds), inArray(rules.serveVariationId, serveIds)),
        ),
      );
    });

    it('fetches based on unavailable params', async () => {
      await rulesRepository.count();

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(rules.deletedAt)));
    });
  });

  describe('exists', () => {
    it('returns true based on available params', async () => {
      const environmentIds = ['environment-id'];
      const flagIds = ['flag-id'];
      const segmentIds = ['segment-id'];
      const serveIds = ['serve-id'];

      methods.limit.mockResolvedValue([{ id: 'rule-id' }]);

      const result = await rulesRepository.exists({
        include: { deleted: true },
        environmentIds,
        flagIds,
        segmentIds,
        serveIds,
      });

      expect(result).toEqual(true);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(
        and(
          inArray(rules.flagId, flagIds),
          inArray(rules.segmentId, segmentIds),
          inArray(rules.environmentId, environmentIds),
          or(inArray(rules.serveFractionalId, serveIds), inArray(rules.serveVariationId, serveIds)),
        ),
      );
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });

    it('returns false based on unavailable params', async () => {
      methods.limit.mockResolvedValue([]);

      const result = await rulesRepository.exists({});

      expect(result).toEqual(false);
      expect(methods.where).toHaveBeenCalledExactlyOnceWith(and(isNull(rules.deletedAt)));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
    });
  });

  describe('findById', () => {
    it('returns a rule when found', async () => {
      const rule = { id: 'rule-id' };
      methods.limit.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.findById('rule-id');

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(rules.id, 'rule-id'));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
      expect(result).toEqual(rule);
    });

    it('returns null when no rule is found', async () => {
      methods.limit.mockResolvedValueOnce([]);

      const result = await rulesRepository.findById('missing-rule-id');

      expect(methods.where).toHaveBeenCalledExactlyOnceWith(eq(rules.id, 'missing-rule-id'));
      expect(methods.limit).toHaveBeenCalledExactlyOnceWith(1);
      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns a rule when found', async () => {
      const rule = { id: 'rule-id' };
      methods.limit.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.getById('rule-id');

      expect(result).toEqual(rule);
    });

    it('throws NotFoundError when no rule is found', async () => {
      methods.limit.mockResolvedValueOnce([]);

      await expect(rulesRepository.getById('missing-rule-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateById', () => {
    const payload = { orderPosition: 2, environmentId: 'env-id' };

    it('handles a successful update', async () => {
      const rule = { id: 'rule-id' };

      methods.returning.mockResolvedValueOnce([rule]);
      methods.limit.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.updateById('rule-id', payload);

      expect(methods.set).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(rule);
    });

    it('throws NotFoundError when no row matches', async () => {
      await expect(rulesRepository.updateById('rule-id', payload)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const payload = {
      conditions: [],
      environmentId: 'env-id',
      flagId: 'flag-id',
      key: 'rule-key',
      orderPosition: 2,
      serveFractionalId: null,
      serveVariationId: 'variation-id',
    };

    it('handles a successful create', async () => {
      const rule = { id: 'rule-id' };

      methods.returning.mockResolvedValueOnce([rule]);
      methods.limit.mockResolvedValueOnce([rule]);

      const result = await rulesRepository.create(payload);

      expect(methods.values).toHaveBeenCalledExactlyOnceWith(payload);
      expect(result).toEqual(rule);
    });

    it('handles a failed create', async () => {
      await expect(rulesRepository.create(payload)).rejects.toThrow(InternalError);
    });
  });

  describe('softDeleteMany', () => {
    it('soft deletes multiple rules and returns the deleted rules', async () => {
      const ruleIds = ['rule-1', 'rule-2'];
      const deletedRules = [{ id: 'rule-1' }, { id: 'rule-2' }];
      methods.for.mockResolvedValueOnce(deletedRules);

      const result = await rulesRepository.softDeleteMany(ruleIds);

      expect(result).toEqual(deletedRules);
      expect(methods.where).toHaveBeenNthCalledWith(1, inArray(rules.id, ruleIds));
      expect(methods.for).toHaveBeenCalledExactlyOnceWith('update', { of: rules });
      expect(methods.set).toHaveBeenCalledExactlyOnceWith({ deletedAt: sql`now()` });
      expect(methods.where).toHaveBeenNthCalledWith(2, inArray(rules.id, ruleIds));
    });
  });
});

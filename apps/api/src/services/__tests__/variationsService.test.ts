// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionType, FeatureFlagType, SubjectType } from 'shared-types';

import { createServiceWithMocks, mockAssertCanWrite, mockRepositories, notAMemberError } from 'test/testUtils.js';
import type { VariationsService } from '../variationsService.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { ForbiddenError } from '../../errors/AppError.js';

describe('createVariationsService', () => {
  let service: VariationsService;

  const featureFlag = {
    applicationId: 'app-1',
    applicationName: 'app-one',
    archived: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    description: 'Test feature flag',
    id: 'flag-1',
    key: 'test-flag',
    type: FeatureFlagType.String,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const variation = {
    id: 'variation-1',
    flagId: 'flag-1',
    key: 'on',
    value: 'enabled',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
  };

  const logEntry = {
    id: 'log-1',
    action: ActionType.Create,
    actorId: 'user-1',
    applicationId: 'app-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    environmentId: null,
    newData: { key: 'on', value: 'enabled' },
    oldData: null,
    subjectId: 'variation-1',
    subjectKey: 'on',
    subjectType: SubjectType.Variation,
  };

  const actorId = logEntry.actorId;

  beforeEach(() => {
    service = createServiceWithMocks.variations;
  });

  describe('listVariations', () => {
    it('fetches based on available params', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.list).mockResolvedValue([variation]);
      vi.mocked(mockRepositories.flagVariationsRepository.count).mockResolvedValue(1);

      const filters = {
        flagIds: [featureFlag.id],
        ids: [variation.id],
        keys: [variation.key],
        include: { deleted: false },
      };

      const result = await service.listVariations({
        filters,
        pagination: { page: 1, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.flagVariationsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters,
        pagination: {
          limit: 10,
          offset: 0,
        },
        sort: {
          field: 'createdAt',
          direction: ColumnSortingDirection.DESC,
        },
      });
      expect(mockRepositories.flagVariationsRepository.count).toHaveBeenCalledExactlyOnceWith(filters);
      expect(result).toEqual({
        data: [variation],
        metadata: {
          page: 1,
          records: 1,
          rows: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      });
    });

    it('fetches based on unavailable params', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.list).mockResolvedValue([]);
      vi.mocked(mockRepositories.flagVariationsRepository.count).mockResolvedValue(0);

      const result = await service.listVariations({
        pagination: { page: 1, rows: 10 },
        sort: { field: 'createdAt', direction: ColumnSortingDirection.DESC },
      });

      expect(mockRepositories.flagVariationsRepository.list).toHaveBeenCalledExactlyOnceWith({
        filters: undefined,
        pagination: {
          limit: 10,
          offset: 0,
        },
        sort: {
          direction: ColumnSortingDirection.DESC,
          field: 'createdAt',
        },
      });
      expect(mockRepositories.flagVariationsRepository.count).toHaveBeenCalledExactlyOnceWith(undefined);
      expect(result).toEqual({
        data: [],
        metadata: {
          page: 1,
          records: 0,
          rows: 10,
          totalPages: 0,
          totalRecords: 0,
        },
      });
    });
  });

  describe('createVariation', () => {
    it('creates a variation', async () => {
      const payload = { flagId: featureFlag.id, key: variation.key, value: variation.value };

      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagVariationsRepository.count).mockResolvedValue(0);
      vi.mocked(mockRepositories.flagVariationsRepository.create).mockResolvedValue(variation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue(logEntry);

      const result = await service.createVariation(payload, actorId);

      expect(mockRepositories.featureFlagsRepository.getById).toHaveBeenCalledExactlyOnceWith(featureFlag.id);
      expect(mockRepositories.flagVariationsRepository.count).toHaveBeenCalledExactlyOnceWith({
        flagIds: [featureFlag.id],
      });
      expect(mockRepositories.flagVariationsRepository.create).toHaveBeenCalledExactlyOnceWith(payload);
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Create,
        actorId,
        applicationId: featureFlag.applicationId,
        newData: { key: variation.key, value: variation.value },
        oldData: null,
        subjectId: variation.id,
        subjectKey: variation.key,
        subjectType: SubjectType.Variation,
      });
      expect(result).toEqual(variation);
    });

    it('throws when a boolean flag already has two variations', async () => {
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue({
        ...featureFlag,
        type: FeatureFlagType.Boolean,
      });
      vi.mocked(mockRepositories.flagVariationsRepository.count).mockResolvedValue(2);

      await expect(
        service.createVariation({ flagId: featureFlag.id, key: variation.key, value: true }, actorId),
      ).rejects.toMatchObject({ status: 422, errors: [{ field: 'variations', code: 'TOO_LONG' }] });
      expect(mockRepositories.flagVariationsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('createManyVariations', () => {
    it('creates multiple variations', async () => {
      const secondVariation = { ...variation, id: 'variation-2', key: 'off', value: 'disabled' };

      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagVariationsRepository.count).mockResolvedValue(0);
      vi.mocked(mockRepositories.flagVariationsRepository.create)
        .mockResolvedValueOnce(variation)
        .mockResolvedValueOnce(secondVariation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue(logEntry);

      const result = await service.createManyVariations(
        [
          { flagId: featureFlag.id, key: variation.key, value: variation.value },
          { flagId: featureFlag.id, key: secondVariation.key, value: secondVariation.value },
        ],
        actorId,
      );

      expect(mockRepositories.flagVariationsRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual([variation, secondVariation]);
    });
  });

  describe('updateVariation', () => {
    it('updates a variation', async () => {
      const updatedVariation = { ...variation, key: 'off', value: 'disabled' };

      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagVariationsRepository.updateById).mockResolvedValue(updatedVariation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue({
        ...logEntry,
        action: ActionType.Edit,
        newData: { key: 'off', value: 'disabled' },
        oldData: { key: 'on', value: 'enabled' },
        subjectKey: 'off',
      });

      const result = await service.updateVariation(
        variation.id,
        { key: updatedVariation.key, value: updatedVariation.value },
        actorId,
      );

      expect(mockRepositories.flagVariationsRepository.getById).toHaveBeenCalledExactlyOnceWith(variation.id);
      expect(mockRepositories.featureFlagsRepository.getById).toHaveBeenCalledExactlyOnceWith(featureFlag.id);
      expect(mockRepositories.flagVariationsRepository.updateById).toHaveBeenCalledExactlyOnceWith(variation.id, {
        key: updatedVariation.key,
        value: updatedVariation.value,
      });
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Edit,
        actorId,
        applicationId: featureFlag.applicationId,
        newData: { key: updatedVariation.key, value: updatedVariation.value },
        oldData: { key: variation.key, value: variation.value },
        subjectId: updatedVariation.id,
        subjectKey: updatedVariation.key,
        subjectType: SubjectType.Variation,
      });
      expect(result).toEqual(updatedVariation);
    });

    it('throws when no update fields are provided', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);

      await expect(service.updateVariation(variation.id, {}, actorId)).rejects.toThrow(
        'At least one of key or value must be provided',
      );
      expect(mockRepositories.flagVariationsRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('updateManyVariations', () => {
    it('updates multiple variations', async () => {
      const updatedVariation = { ...variation, value: 'disabled' };

      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagVariationsRepository.updateById).mockResolvedValue(updatedVariation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue({
        ...logEntry,
        action: ActionType.Edit,
        newData: { value: 'disabled' },
        oldData: { key: 'on', value: 'enabled' },
      });

      const result = await service.updateManyVariations([{ id: variation.id, value: 'disabled' }], actorId);

      expect(mockRepositories.flagVariationsRepository.updateById).toHaveBeenCalledExactlyOnceWith(variation.id, {
        key: 'on',
        value: 'disabled',
      });
      expect(result).toEqual([updatedVariation]);
    });
  });

  describe('deleteVariation', () => {
    it('soft deletes a variation', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.flagVariationsRepository.softDeleteById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue({
        ...logEntry,
        action: ActionType.Delete,
        newData: null,
        oldData: { key: 'on', value: 'enabled' },
      });

      const result = await service.deleteVariation(variation.id, actorId);

      expect(mockRepositories.flagEnvironmentsRepository.exists).toHaveBeenCalledExactlyOnceWith({
        defaultServeIds: [variation.id],
      });
      expect(mockRepositories.rulesRepository.exists).toHaveBeenCalledExactlyOnceWith({ serveIds: [variation.id] });
      expect(mockRepositories.flagVariationsRepository.softDeleteById).toHaveBeenCalledExactlyOnceWith(variation.id);
      expect(mockRepositories.logsRepository.create).toHaveBeenCalledExactlyOnceWith({
        action: ActionType.Delete,
        actorId,
        applicationId: featureFlag.applicationId,
        newData: null,
        oldData: { key: variation.key, value: variation.value },
        subjectId: variation.id,
        subjectKey: variation.key,
        subjectType: SubjectType.Variation,
      });
      expect(result).toEqual(variation);
    });

    it('throws when variation is used as a default variation', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);

      await expect(service.deleteVariation(variation.id, actorId)).rejects.toThrow(
        `Variation '${variation.key}' is currently being used as the default variation for this flag`,
      );
      expect(mockRepositories.flagVariationsRepository.softDeleteById).not.toHaveBeenCalled();
    });

    it('throws when variation is used in a rule', async () => {
      vi.mocked(mockRepositories.flagVariationsRepository.getById).mockResolvedValue(variation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(true);

      await expect(service.deleteVariation(variation.id, actorId)).rejects.toThrow(
        `Variation '${variation.key}' is currently being used in a rule for this flag`,
      );
      expect(mockRepositories.flagVariationsRepository.softDeleteById).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyVariations', () => {
    it('deletes multiple variations', async () => {
      const secondVariation = { ...variation, id: 'variation-2', key: 'off', value: 'disabled' };

      vi.mocked(mockRepositories.flagVariationsRepository.getById)
        .mockResolvedValueOnce(variation)
        .mockResolvedValueOnce(secondVariation);
      vi.mocked(mockRepositories.featureFlagsRepository.getById).mockResolvedValue(featureFlag);
      vi.mocked(mockRepositories.flagEnvironmentsRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.rulesRepository.exists).mockResolvedValue(false);
      vi.mocked(mockRepositories.flagVariationsRepository.softDeleteById)
        .mockResolvedValueOnce(variation)
        .mockResolvedValueOnce(secondVariation);
      vi.mocked(mockRepositories.logsRepository.create).mockResolvedValue({
        ...logEntry,
        action: ActionType.Delete,
        newData: null,
        oldData: { key: 'on', value: 'enabled' },
      });

      const result = await service.deleteManyVariations([variation.id, secondVariation.id], actorId);

      expect(mockRepositories.flagVariationsRepository.softDeleteById).toHaveBeenCalledTimes(2);
      expect(result).toEqual([variation, secondVariation]);
    });
  });

  describe('authorization', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockAssertCanWrite.mockRejectedValue(notAMemberError());
    });

    afterEach(() => {
      mockAssertCanWrite.mockReset();
    });

    describe('createVariation', () => {
      it('authorizes on the target feature flag before writing', async () => {
        await expect(
          service.createVariation({ flagId: 'flag-1', key: 'on', value: true }, 'user-1'),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'featureFlag', 'flag-1');
        expect(mockRepositories.flagVariationsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('createManyVariations', () => {
      it('authorizes the full flag id set before writing', async () => {
        await expect(
          service.createManyVariations(
            [
              { flagId: 'flag-1', key: 'a', value: true },
              { flagId: 'flag-2', key: 'b', value: false },
            ],
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'featureFlag', ['flag-1', 'flag-2']);
        expect(mockRepositories.flagVariationsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('updateVariation', () => {
      it('authorizes on the variation before writing', async () => {
        await expect(service.updateVariation('var-1', { key: 'x' }, 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'variation', 'var-1');
        expect(mockRepositories.flagVariationsRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('updateManyVariations', () => {
      it('authorizes the full variation id set before writing', async () => {
        await expect(
          service.updateManyVariations(
            [
              { id: 'var-1', key: 'x' },
              { id: 'var-2', key: 'y' },
            ],
            'user-1',
          ),
        ).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'variation', ['var-1', 'var-2']);
        expect(mockRepositories.flagVariationsRepository.updateById).not.toHaveBeenCalled();
      });
    });

    describe('deleteVariation', () => {
      it('authorizes on the variation before writing', async () => {
        await expect(service.deleteVariation('var-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'variation', 'var-1');
        expect(mockRepositories.flagVariationsRepository.softDeleteById).not.toHaveBeenCalled();
      });
    });

    describe('deleteManyVariations', () => {
      it('authorizes the full variation id set before writing', async () => {
        await expect(service.deleteManyVariations(['var-1', 'var-2'], 'user-1')).rejects.toBeInstanceOf(ForbiddenError);
        expect(mockAssertCanWrite).toHaveBeenCalledWith('user-1', 'variation', ['var-1', 'var-2']);
        expect(mockRepositories.flagVariationsRepository.softDeleteById).not.toHaveBeenCalled();
      });
    });
  });
});

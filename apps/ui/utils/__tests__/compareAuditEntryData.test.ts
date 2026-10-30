// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import compareAuditEntryData from '../compareAuditEntryData';

describe('compareAuditEntryData', () => {
  it('should compare feature flag data', () => {
    const oldData = { name: 'old', enabled: true };
    const newData = { name: 'new', enabled: true };

    const result = compareAuditEntryData(SubjectType.FeatureFlag, oldData, newData);

    expect(result).toEqual({
      add: [],
      change: [{ property: 'name', oldValue: 'old', newValue: 'new' }],
      remove: [],
    });
  });

  it('should compare rule data', () => {
    const oldData = { key: 'old-key', conditions: [] };
    const newData = { key: 'new-key', conditions: [] };

    const result = compareAuditEntryData(SubjectType.Rule, oldData, newData);

    expect(result).toEqual({
      add: [],
      change: [{ property: 'key', oldValue: 'old-key', newValue: 'new-key' }],
      remove: [],
    });
  });

  it('should compare variation data', () => {
    const oldData = { key: 'cool' };
    const newData = { key: 'not-cool' };

    const result = compareAuditEntryData(SubjectType.Variation, oldData, newData);

    expect(result).toEqual({
      add: [],
      change: [{ property: 'key', oldValue: 'cool', newValue: 'not-cool' }],
      remove: [],
    });
  });

  it('should compare segment data', () => {
    const oldData = { description: 'old', key: 'segment1' };
    const newData = { description: 'new', key: 'segment1' };

    const result = compareAuditEntryData(SubjectType.Segment, oldData, newData);

    expect(result).toEqual({
      add: [],
      change: [{ property: 'description', oldValue: 'old', newValue: 'new' }],
      remove: [],
    });
  });

  it('should return empty changes when no data provided', () => {
    const result = compareAuditEntryData(SubjectType.FeatureFlag, null, null);

    expect(result).toEqual({
      add: [],
      change: [],
      remove: [],
    });
  });

  it('should return empty changes when only old data provided', () => {
    const oldData = { name: 'old' };

    const result = compareAuditEntryData(SubjectType.FeatureFlag, oldData, null);

    expect(result).toEqual({
      add: [],
      change: [],
      remove: [],
    });
  });

  it('should return empty changes when only new data provided', () => {
    const newData = { name: 'new' };

    const result = compareAuditEntryData(SubjectType.FeatureFlag, null, newData);

    expect(result).toEqual({
      add: [],
      change: [],
      remove: [],
    });
  });

  it('should handle unknown subject type', () => {
    const oldData = { name: 'old' };
    const newData = { name: 'new' };

    const result = compareAuditEntryData('unknown' as SubjectType, oldData, newData);

    expect(result).toEqual({
      add: [],
      change: [],
      remove: [],
    });
  });
});

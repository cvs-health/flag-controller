// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { desc } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import getOrderByFromSort from '../getOrderByFromSort.js';
import { ColumnSortingDirection } from '../../types/common.js';
import { featureFlags } from 'db/schema/featureFlags.js';

describe('getOrderByFromSort', () => {
  it('returns the matching ascending column when the sort direction is asc', () => {
    expect(
      getOrderByFromSort(featureFlags, 'key:asc', {
        field: 'archived',
        direction: ColumnSortingDirection.ASC,
      }),
    ).toEqual(featureFlags.archived);
  });

  it('returns a descending clause when the sort direction is desc', () => {
    expect(
      getOrderByFromSort(featureFlags, 'key:asc', {
        field: 'archived',
        direction: ColumnSortingDirection.DESC,
      }),
    ).toEqual(desc(featureFlags.archived));
  });

  it('returns the default sort when the sort is not provided', () => {
    expect(getOrderByFromSort(featureFlags, 'key:asc')).toEqual(featureFlags.key);
    expect(getOrderByFromSort(featureFlags, 'archived:desc')).toEqual(desc(featureFlags.archived));
  });

  it('falls back to the default sort column when the sort field is invalid', () => {
    expect(
      getOrderByFromSort(featureFlags, 'key:asc', {
        field: 'invalidField' as keyof typeof featureFlags,
        direction: ColumnSortingDirection.DESC,
      }),
    ).toEqual(desc(featureFlags.key));
  });
});

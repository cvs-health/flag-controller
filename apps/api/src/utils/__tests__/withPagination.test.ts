// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import type { PgSelect } from 'drizzle-orm/pg-core';
import { PAGINATION_NO_LIMIT } from '../../constants/pagination.js';
import withPagination from '../withPagination.js';

function createMockQuery() {
  return {
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
  } as unknown as PgSelect;
}

describe('withPagination', () => {
  it('applies limit and offset when limit is not PAGINATION_NO_LIMIT', () => {
    const query = createMockQuery();

    withPagination(query, { limit: 25, offset: 50 });

    expect(query.limit).toHaveBeenCalledWith(25);
    expect(query.offset).toHaveBeenCalledWith(50);
  });

  it('does not apply limit or offset when limit is PAGINATION_NO_LIMIT', () => {
    const query = createMockQuery();

    withPagination(query, { limit: PAGINATION_NO_LIMIT, offset: 0 });

    expect(query.limit).not.toHaveBeenCalled();
    expect(query.offset).not.toHaveBeenCalled();
  });

  it('returns the query for chaining', () => {
    const query = createMockQuery();

    const result = withPagination(query, { limit: 10, offset: 0 });

    expect(result).toBe(query);
  });

  it('defaults offset to 0 when not provided', () => {
    const query = createMockQuery();

    withPagination(query, { limit: 10 });

    expect(query.limit).toHaveBeenCalledWith(10);
    expect(query.offset).toHaveBeenCalledWith(0);
  });
});

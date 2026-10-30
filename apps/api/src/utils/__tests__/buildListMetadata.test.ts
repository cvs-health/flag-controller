// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import buildListMetadata from 'utils/buildListMetadata.js';
import { describe, it, expect } from 'vitest';

describe('buildListMetadata', () => {
  it('builds list metadata', () => {
    expect(buildListMetadata([], 0, { page: 1, rows: 10 })).toEqual({
      page: 1,
      records: 0,
      rows: 10,
      totalPages: 0,
      totalRecords: 0,
    });
  });

  describe('search and sort options', () => {
    const pagination = { page: 1, rows: 10 };

    it('includes search and sort when provided', () => {
      expect(buildListMetadata([], 0, pagination, { search: 'foo', sort: 'key:asc' })).toMatchObject({
        search: 'foo',
        sort: 'key:asc',
      });
    });

    it('includes an empty-string search', () => {
      expect(buildListMetadata([], 0, pagination, { search: '' })).toMatchObject({ search: '' });
    });

    it('omits keys that are not provided', () => {
      const metadata = buildListMetadata([], 0, pagination, { sort: 'key:asc' });

      expect(metadata).toMatchObject({ sort: 'key:asc' });
      expect(metadata).not.toHaveProperty('search');
    });
  });
});

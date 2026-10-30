// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import buildListMetadata from 'utils/buildListMetadata.js';
import buildListResult from 'utils/buildListResult.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('utils/buildListMetadata.js', () => ({
  default: vi.fn(),
}));

const metadata = { page: 1, records: 0, rows: 10, totalPages: 0, totalRecords: 0 };

describe('buildListResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildListMetadata).mockReturnValue(metadata);
  });

  it('wraps data and delegates the metadata to buildListMetadata', () => {
    const data = [{ id: 1 }];
    const pagination = { page: 2, rows: 10 };
    const options = { search: 'foo', sort: 'key:asc' };

    const result = buildListResult(data, 5, pagination, options);

    expect(buildListMetadata).toHaveBeenCalledExactlyOnceWith(data, 5, pagination, options);
    expect(result).toEqual({ data, metadata });
  });

  it('works as expected when no options are provided', () => {
    const pagination = { page: 1, rows: 10 };

    buildListResult([], 0, pagination);

    expect(buildListMetadata).toHaveBeenCalledExactlyOnceWith([], 0, pagination, undefined);
  });
});

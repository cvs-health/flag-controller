// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import getAuditLog, { getAuditLogUrl } from '../getAuditLog';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import type { ColumnSorting, Pagination } from '../../../typings/api';

describe('getAuditLog', () => {
  it('should call the api', async () => {
    const args: [string, Pagination, ColumnSorting, string] = ['search', { rows: 1, page: 1 }, 'date:desc', ''];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getAuditLog(...args);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}${getAuditLogUrl(...args)}`, expect.any(Object));
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getSegmentAuditLog, { getSegmentAuditLogUrl } from '../getSegmentAuditLog';
import { ColumnSortingDirection } from '../../../typings/api';

describe('getSegmentAuditLog', () => {
  it('should call the api', async () => {
    const sort = `createdAt:${ColumnSortingDirection.ASC}`;
    const segmentId = 'segment-id';
    const pagination = {
      page: 1,
      rows: 10,
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getSegmentAuditLog(segmentId, pagination, sort);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getSegmentAuditLogUrl(segmentId, pagination, sort)}`,
      expect.any(Object),
    );
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getSegmentRules, { getSegmentRulesUrl } from '../getSegmentRules';

describe('getSegmentRules', () => {
  it('should call the api', async () => {
    const environmentId = 'environmentId';
    const segmentId = 'segmentId';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getSegmentRules(environmentId, segmentId);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `${process.env.API_BASE_URL}${getSegmentRulesUrl(environmentId, segmentId)}`,
      expect.any(Object),
    );
  });
});

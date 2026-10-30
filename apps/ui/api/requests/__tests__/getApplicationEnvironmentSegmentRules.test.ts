// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import getApplicationEnvironmentSegmentRules, {
  getApplicationEnvironmentSegmentRulesUrl,
} from '../getApplicationEnvironmentSegmentRules';

describe('getApplicationEnvironmentSegmentRules', () => {
  it('should call the api', async () => {
    const args: [string, string, string] = ['applicationName', 'environmentKey', 'segmentKey'];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await getApplicationEnvironmentSegmentRules(...args);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${getApplicationEnvironmentSegmentRulesUrl(...args)}`,
      expect.any(Object),
    );
  });
});

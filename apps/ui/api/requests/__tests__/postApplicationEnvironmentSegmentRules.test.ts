// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import postApplicationEnvironmentSegmentRules, {
  postApplicationEnvironmentSegmentRulesUrl,
} from '../postApplicationEnvironmentSegmentRules';

describe('postApplicationEnvironmentSegmentRules', () => {
  it('should call the api', async () => {
    const requestPayload = {
      applicationName: 'applicationName',
      environmentKey: 'environmentKey',
      segmentKey: 'segmentKey',
      body: [],
    };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await postApplicationEnvironmentSegmentRules(requestPayload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}${postApplicationEnvironmentSegmentRulesUrl(requestPayload.applicationName, requestPayload.environmentKey, requestPayload.segmentKey)}`,
      expect.any(Object),
    );
  });
});

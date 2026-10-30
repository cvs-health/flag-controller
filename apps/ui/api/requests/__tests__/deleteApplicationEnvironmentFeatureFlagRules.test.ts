// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import deleteRules, { deleteRulesUrl } from '../deleteRules';

describe('deleteRules', () => {
  it('should call the api', async () => {
    const requestPayload = ['rule-id-1'];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await deleteRules(requestPayload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${deleteRulesUrl}`, expect.any(Object));
  });
});

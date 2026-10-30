// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import deleteRules, { deleteRulesUrl } from '../deleteRules';

describe('deleteRules', () => {
  it('should call the api', async () => {
    const payload = ['rule-1', 'rule-2'];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData([]));

    await deleteRules(payload);

    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${process.env.API_BASE_URL}${deleteRulesUrl}`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        cookie: '',
      },
    });
  });
});

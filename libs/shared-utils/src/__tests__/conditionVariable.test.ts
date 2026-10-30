// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import conditionVariable from '../conditionVariable.js';

describe('conditionVariable', () => {
  it('should provide the proper condition variable via dot notation', () => {
    expect(conditionVariable('user', 'country')).toEqual('user.country');
    expect(conditionVariable('user')).toEqual('user');
  });
});

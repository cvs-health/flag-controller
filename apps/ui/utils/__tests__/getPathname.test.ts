// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import getPathname from '../getPathname';

describe('getPathname', () => {
  it('should return the pathname', async () => {
    const pathname = '/test';

    expect(await getPathname()).toEqual(pathname);
  });
});

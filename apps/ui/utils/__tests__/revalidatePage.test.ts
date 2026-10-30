// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import revalidatePage from '../revalidatePage';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('revalidatePage', () => {
  it('should call revalidatePath with correct parameters', async () => {
    const { revalidatePath } = await import('next/cache');

    await revalidatePage();

    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/', 'page');
  });
});

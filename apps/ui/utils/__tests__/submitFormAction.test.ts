// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import submitFormAction from '../submitFormAction';

describe('submitFormAction', () => {
  it('should prevent default and pass FormData to formAction', () => {
    const formAction = vi.fn();
    const preventDefault = vi.fn();
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'timeRange';
    input.value = 'none';
    form.appendChild(input);

    submitFormAction(
      // @ts-expect-error We don't need all of the properties
      {
        preventDefault,
        currentTarget: form,
      },
      formAction,
    );

    expect(preventDefault).toHaveBeenCalledExactlyOnceWith();
    expect(formAction).toHaveBeenCalledExactlyOnceWith(new FormData(form));
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { FormAction, ActionStatus } from '../../typings/common';
import deriveFiltersFormActionState from '../deriveFiltersFormActionState';

describe('deriveFiltersFormActionState', () => {
  it('should handle all FormAction cases correctly', () => {
    const mockPreviousState = {
      status: ActionStatus.Idle,
      errorMessage: 'Some error',
      form: { name: 'current value' },
      previousForm: { name: 'previous value' },
      filterCount: 0,
      parsed: {},
    };
    const mockDefaultFormData = { name: '' };

    const resetStatusResult = deriveFiltersFormActionState(
      FormAction.ResetStatus,
      mockPreviousState,
      mockDefaultFormData,
    );
    expect(resetStatusResult).toEqual({
      ...mockPreviousState,
      status: ActionStatus.Idle,
    });

    const resetFormResult = deriveFiltersFormActionState(FormAction.ResetForm, mockPreviousState, mockDefaultFormData);
    expect(resetFormResult).toEqual({
      ...mockPreviousState,
      errorMessage: '',
      form: mockDefaultFormData,
      previousForm: mockPreviousState.previousForm,
      status: ActionStatus.Idle,
    });

    const restoreFormResult = deriveFiltersFormActionState(
      FormAction.RestoreForm,
      mockPreviousState,
      mockDefaultFormData,
    );
    expect(restoreFormResult).toEqual({
      ...mockPreviousState,
      errorMessage: '',
      form: mockPreviousState.previousForm,
      previousForm: mockPreviousState.previousForm,
      status: ActionStatus.Idle,
    });

    const defaultResult = deriveFiltersFormActionState('foobar' as FormAction, mockPreviousState, mockDefaultFormData);
    expect(defaultResult).toEqual(mockPreviousState);
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { type FiltersFormDataState, FormAction, ActionStatus } from '../typings/common';

function deriveFiltersFormActionState<R, P>(
  status: FormAction,
  previousState: FiltersFormDataState<R, P>,
  defaultFormData: R,
): FiltersFormDataState<R, P> {
  switch (status) {
    case FormAction.ResetStatus:
      return {
        ...previousState,
        status: ActionStatus.Idle,
      };
    case FormAction.ResetForm:
      return {
        ...previousState,
        errorMessage: '',
        form: defaultFormData,
        previousForm: previousState.previousForm,
        status: ActionStatus.Idle,
      };
    case FormAction.RestoreForm:
      return {
        ...previousState,
        errorMessage: '',
        form: previousState.previousForm,
        previousForm: previousState.previousForm,
        status: ActionStatus.Idle,
      };
    default:
      return previousState;
  }
}

export default deriveFiltersFormActionState;

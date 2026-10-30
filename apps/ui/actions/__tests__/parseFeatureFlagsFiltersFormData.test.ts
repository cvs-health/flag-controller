// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { EnvironmentKey, FeatureFlagType } from 'shared-types';

import { FormAction, ActionStatus } from '../../typings/common';
import parseFeatureFlagsFiltersFormData from '../parseFeatureFlagsFiltersFormData';

describe('parseFeatureFlagFiltersFormData', () => {
  it('should parse the form data', async () => {
    const form = {
      archived: false,
      createdAtStartDate: '',
      updatedAtEndDate: '',
      updatedAtStartDate: '',
      createdAtEndDate: '',
      enabled: [],
      type: [],
    };
    const initialState = {
      errorMessage: '',
      filterCount: 0,
      form,
      parsed: {},
      previousForm: form,
      status: ActionStatus.Idle,
    };
    const data = {
      archived: 'true',
      createdAtEndDate: '2023-10-01',
      createdAtStartDate: '2022-10-01',
      enabled: [EnvironmentKey.Development],
      updatedAtEndDate: '2023-10-01',
      updatedAtStartDate: '2022-10-01',
      type: [FeatureFlagType.Boolean],
    };
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const result = parseFeatureFlagsFiltersFormData(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.parsed).toEqual({
      archived: true,
      createdAtEndDate: '2023-09-30T23:59:59-04:00',
      createdAtStartDate: '2022-09-30T00:00:00-04:00',
      enabled: true,
      environmentKey: [EnvironmentKey.Development],
      featureFlagTypes: [FeatureFlagType.Boolean],
      updatedAtEndDate: '2023-09-30T23:59:59-04:00',
      updatedAtStartDate: '2022-09-30T00:00:00-04:00',
    });
    expect(result.filterCount).toEqual(5);
  });

  it('should reset status when FormAction.ResetStatus is passed', () => {
    const form = {
      archived: true,
      createdAtEndDate: '2023-10-01',
      createdAtStartDate: '2022-10-01',
      enabled: [EnvironmentKey.Development],
      updatedAtEndDate: '2023-10-01',
      updatedAtStartDate: '2022-10-01',
      type: [FeatureFlagType.Boolean],
    };
    const initialState = {
      errorMessage: '',
      filterCount: 5,
      form,
      parsed: { enabled: true },
      previousForm: form,
      status: ActionStatus.Success,
    };
    const result = parseFeatureFlagsFiltersFormData(initialState, FormAction.ResetStatus);

    expect(result.status).toEqual(ActionStatus.Idle);
    expect(result.form).toEqual(initialState.form);
    expect(result.parsed).toEqual(initialState.parsed);
    expect(result.filterCount).toEqual(initialState.filterCount);
  });

  it('should reset form when FormAction.ResetForm is passed', () => {
    const form = {
      archived: true,
      createdAtEndDate: '2023-10-01',
      createdAtStartDate: '2022-10-01',
      enabled: [EnvironmentKey.Development, EnvironmentKey.Production],
      updatedAtEndDate: '2023-10-01',
      updatedAtStartDate: '2022-10-01',
      type: [FeatureFlagType.Boolean],
    };
    const initialState = {
      errorMessage: 'Some error',
      filterCount: 3,
      form,
      parsed: { enabled: true },
      previousForm: form,
      status: ActionStatus.Success,
    };
    const result = parseFeatureFlagsFiltersFormData(initialState, FormAction.ResetForm);

    expect(result.errorMessage).toEqual('');
    expect(result.previousForm).toEqual(initialState.form);
    expect(result.form).toEqual({
      archived: false,
      createdAtEndDate: '',
      createdAtStartDate: '',
      enabled: [],
      updatedAtEndDate: '',
      updatedAtStartDate: '',
      type: [],
    });
  });

  it('should restore form when FormAction.RestoreForm is passed', () => {
    const form = {
      archived: false,
      enabled: [],
      type: [],
      createdAtEndDate: '',
      createdAtStartDate: '',
      updatedAtEndDate: '',
      updatedAtStartDate: '',
    };
    const previousForm = {
      archived: true,
      enabled: [EnvironmentKey.Development],
      type: [FeatureFlagType.Boolean],
      createdAtEndDate: '2023-10-01',
      createdAtStartDate: '2022-10-01',
      updatedAtEndDate: '2023-10-01',
      updatedAtStartDate: '2022-10-01',
    };
    const initialState = {
      errorMessage: '',
      filterCount: 0,
      form,
      parsed: {},
      previousForm,
      status: ActionStatus.Idle,
    };
    const result = parseFeatureFlagsFiltersFormData(initialState, FormAction.RestoreForm);

    expect(result.form).toEqual(previousForm);
  });
});

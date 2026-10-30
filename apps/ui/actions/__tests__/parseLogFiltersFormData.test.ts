// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import parseLogFiltersFormData from '../parseLogFiltersFormData';
import { FormAction, ActionStatus, TimeRange } from '../../typings/common';

describe('parseLogFiltersFormData', () => {
  it('should parse the form data', async () => {
    const form = {
      action: [],
      environment: [],
      subject: [],
      actionEndDate: '',
      actionStartDate: '',
      timeRange: TimeRange.None,
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
      action: ActionType.Archive,
      actionEndDate: '2023-10-01',
      actionStartDate: '2022-10-01',
      environment: EnvironmentKey.Development,
      subject: SubjectType.FeatureFlag,
      timeRange: TimeRange.Custom,
    };
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = parseLogFiltersFormData(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.parsed).toEqual({
      actionEndDate: '2023-09-30T23:59:59-04:00',
      actionStartDate: '2022-09-30T00:00:00-04:00',
      actionType: [ActionType.Archive],
      environmentKey: [EnvironmentKey.Development],
      subjectType: [SubjectType.FeatureFlag],
      timeRange: TimeRange.Custom,
    });
    expect(result.filterCount).toEqual(4);
  });

  it('should handle default form data submission', async () => {
    const form = {
      action: [],
      environment: [],
      subject: [],
      actionEndDate: '',
      actionStartDate: '',
      timeRange: TimeRange.None,
    };
    const initialState = {
      errorMessage: '',
      filterCount: 0,
      form,
      parsed: {},
      previousForm: form,
      status: ActionStatus.Idle,
    };
    const formData = new FormData();
    const result = parseLogFiltersFormData(initialState, formData);

    expect(result.status).toEqual(ActionStatus.Success);
    expect(result.parsed).toEqual({ timeRange: TimeRange.None });
    expect(result.filterCount).toEqual(0);
  });

  it('should reset status when FormAction.ResetStatus is passed', () => {
    const form = {
      action: [],
      environment: [],
      subject: [],
      actionEndDate: '',
      actionStartDate: '',
      timeRange: TimeRange.None,
    };
    const initialState = {
      errorMessage: '',
      filterCount: 5,
      form,
      parsed: { timeRange: TimeRange.Custom },
      previousForm: form,
      status: ActionStatus.Success,
    };
    const result = parseLogFiltersFormData(initialState, FormAction.ResetStatus);

    expect(result.status).toEqual(ActionStatus.Idle);
    expect(result.form).toEqual(initialState.form);
    expect(result.parsed).toEqual(initialState.parsed);
    expect(result.filterCount).toEqual(initialState.filterCount);
  });

  it('should reset form when FormAction.ResetForm is passed', () => {
    const form = {
      action: [],
      actionEndDate: '',
      actionStartDate: '',
      environment: [],
      subject: [],
      timeRange: TimeRange.None,
    };
    const initialState = {
      errorMessage: 'Some error',
      filterCount: 3,
      form,
      parsed: {},
      previousForm: form,
      status: ActionStatus.Success,
    };
    const result = parseLogFiltersFormData(initialState, FormAction.ResetForm);

    expect(result.errorMessage).toEqual('');
    expect(result.previousForm).toEqual(initialState.form);
    expect(result.form).toEqual(form);
  });

  it('should restore form when FormAction.RestoreForm is passed', () => {
    const form = {
      action: [],
      actionEndDate: '',
      actionStartDate: '',
      environment: [],
      subject: [],
      timeRange: TimeRange.None,
    };
    const previousForm = {
      action: [ActionType.Archive],
      actionEndDate: '',
      actionStartDate: '',
      environment: [],
      subject: [SubjectType.FeatureFlag],
      timeRange: TimeRange.None,
    };
    const initialState = {
      errorMessage: '',
      filterCount: 0,
      form,
      parsed: {},
      previousForm,
      status: ActionStatus.Idle,
    };
    const result = parseLogFiltersFormData(initialState, FormAction.RestoreForm);

    expect(result.form).toEqual(previousForm);
  });

  it('should use current form when FormAction.RestoreForm is passed but no previousForm exists', () => {
    const form = {
      action: [],
      environment: [],
      subject: [],
      actionEndDate: '',
      actionStartDate: '',
      timeRange: TimeRange.None,
    };
    const initialState = {
      errorMessage: '',
      filterCount: 0,
      form,
      parsed: {},
      previousForm: form,
      status: ActionStatus.Idle,
    };
    const result = parseLogFiltersFormData(initialState, FormAction.RestoreForm);

    expect(result.form).toEqual(form);
  });
});

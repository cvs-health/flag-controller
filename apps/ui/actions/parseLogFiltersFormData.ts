// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ActionType, SubjectType, EnvironmentKey } from 'shared-types';

import deriveFiltersFormActionState from '../utils/deriveFiltersFormActionState';
import logFiltersCount from '../utils/logFiltersCount';
import timeRangeDates from '../utils/timeRangeDates';
import { type FormAction, ActionStatus, TimeRange } from '../typings/common';

export interface ParsedLogFiltersFormData {
  actionEndDate: string;
  actionStartDate: string;
  actionTypes: ActionType[];
  environmentKeys: string[];
  subjectTypes: SubjectType[];
  timeRange: TimeRange;
}

interface ParseLogFiltersFormDataState {
  errorMessage: string;
  filterCount: number;
  form: LogFiltersFormData;
  parsed: Partial<ParsedLogFiltersFormData>;
  previousForm: LogFiltersFormData;
  status: ActionStatus;
}

interface LogFiltersFormData {
  action: ActionType[];
  actionEndDate?: string;
  actionStartDate?: string;
  environment: EnvironmentKey[];
  subject: SubjectType[];
  timeRange: TimeRange;
}

/**
 * Parse log filters form data
 */
function parseLogFiltersFormData(
  prevState: ParseLogFiltersFormDataState,
  formData: FormData | FormAction,
): ParseLogFiltersFormDataState {
  if (formData instanceof FormData) {
    const rawFormData = {
      action: formData.getAll('action') as ActionType[],
      actionEndDate: (formData.get('actionEndDate') as string) || '',
      actionStartDate: (formData.get('actionStartDate') as string) || '',
      environment: formData.getAll('environment') as EnvironmentKey[],
      subject: formData.getAll('subject') as SubjectType[],
      timeRange: (formData.get('timeRange') as TimeRange) || TimeRange.None,
    };
    const [actionStartDate, actionEndDate] = timeRangeDates(
      rawFormData.actionStartDate,
      rawFormData.actionEndDate,
      rawFormData.timeRange,
    );
    const parsed = Object.fromEntries(
      Object.entries({
        actionEndDate,
        actionStartDate,
        actionType: rawFormData.action.length ? rawFormData.action : undefined,
        environmentKey: rawFormData.environment.length ? rawFormData.environment : undefined,
        subjectType: rawFormData.subject.length ? rawFormData.subject : undefined,
        timeRange: rawFormData.timeRange || undefined,
      }).filter(([, value]) => value),
    );
    const filterCount = logFiltersCount({
      actionTypes: rawFormData.action,
      environmentKeys: rawFormData.environment,
      subjectTypes: rawFormData.subject,
      timeRange: rawFormData.timeRange,
    });

    return {
      ...prevState,
      errorMessage: '',
      filterCount,
      form: rawFormData,
      parsed,
      previousForm: rawFormData,
      status: ActionStatus.Success,
    };
  }

  const defaultFormData = {
    action: [],
    actionEndDate: '',
    actionStartDate: '',
    environment: [],
    subject: [],
    timeRange: TimeRange.None,
  };

  return deriveFiltersFormActionState(formData, prevState, defaultFormData);
}

export default parseLogFiltersFormData;

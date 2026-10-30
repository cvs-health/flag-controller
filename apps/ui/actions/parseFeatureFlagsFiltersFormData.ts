// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { endOfDay, formatISO, startOfDay } from 'date-fns';
import type { EnvironmentKey, FeatureFlagType } from 'shared-types';

import deriveFiltersFormActionState from '../utils/deriveFiltersFormActionState';
import flagsFiltersCount from '../utils/flagsFiltersCount';
import { type FiltersFormDataState, type FormAction, ActionStatus } from '../typings/common';

interface FeatureFlagFiltersFormData {
  archived: boolean;
  createdAtEndDate: string;
  createdAtStartDate: string;
  enabled: EnvironmentKey[];
  updatedAtEndDate: string;
  updatedAtStartDate: string;
  type: FeatureFlagType[];
}

export interface ParsedFeatureFlagsFilterFormData {
  archived: boolean;
  createdAtEndDate: string;
  createdAtStartDate: string;
  enabled: boolean;
  environmentKey: EnvironmentKey[];
  featureFlagTypes: FeatureFlagType[];
  updatedAtEndDate: string;
  updatedAtStartDate: string;
}

type State = FiltersFormDataState<FeatureFlagFiltersFormData, ParsedFeatureFlagsFilterFormData>;

/**
 * Parse feature flags filter form data
 */
function parseFeatureFlagsFiltersFormData(prevState: State, formData: FormData | FormAction): State {
  if (formData instanceof FormData) {
    const rawFormData = {
      archived: formData.get('archived') === 'true',
      createdAtEndDate: formData.get('createdAtEndDate') as string,
      createdAtStartDate: formData.get('createdAtStartDate') as string,
      enabled: formData.getAll('enabled') as EnvironmentKey[],
      updatedAtEndDate: formData.get('updatedAtEndDate') as string,
      updatedAtStartDate: formData.get('updatedAtStartDate') as string,
      type: formData.getAll('type') as FeatureFlagType[],
    };
    const parsed = Object.fromEntries(
      Object.entries({
        archived: rawFormData.archived || undefined,
        createdAtEndDate: rawFormData.createdAtEndDate && formatISO(endOfDay(rawFormData.createdAtEndDate)),
        createdAtStartDate: rawFormData.createdAtStartDate && formatISO(startOfDay(rawFormData.createdAtStartDate)),
        enabled: rawFormData.enabled.length ? true : undefined,
        environmentKey: rawFormData.enabled.length ? rawFormData.enabled : undefined,
        featureFlagTypes: rawFormData.type.length ? rawFormData.type : undefined,
        updatedAtEndDate: rawFormData.updatedAtEndDate && formatISO(endOfDay(rawFormData.updatedAtEndDate)),
        updatedAtStartDate: rawFormData.updatedAtStartDate && formatISO(startOfDay(rawFormData.updatedAtStartDate)),
      }).filter(([, value]) => value),
    );
    const filterCount = flagsFiltersCount({
      ...rawFormData,
      enabledIn: rawFormData.enabled,
      featureFlagTypes: rawFormData.type,
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
    archived: false,
    createdAtEndDate: '',
    createdAtStartDate: '',
    enabled: [],
    updatedAtEndDate: '',
    updatedAtStartDate: '',
    type: [],
  };

  return deriveFiltersFormActionState(formData, prevState, defaultFormData);
}

export default parseFeatureFlagsFiltersFormData;

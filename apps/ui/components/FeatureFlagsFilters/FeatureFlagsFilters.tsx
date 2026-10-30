// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import type { FeatureFlagType, EnvironmentKey } from 'shared-types';
import { Filter } from '@carbon/icons-react';
import { format } from 'date-fns';
import { startTransition, useActionState, useEffect, useRef, useState, type SubmitEvent } from 'react';

import parseFeatureFlagsFiltersFormData, {
  type ParsedFeatureFlagsFilterFormData,
} from '../../actions/parseFeatureFlagsFiltersFormData';
import type { FeatureFlagsFilters as IFeatureFlagsFilters } from '../../typings/flags';
import { dateFormat, environmentLabels, featureFlagTypeLabels } from '../../constants/common';
import { FormAction, ActionStatus } from '../../typings/common';
import flagsFiltersCount from '../../utils/flagsFiltersCount';
import {
  Button,
  Checkbox,
  DatePicker,
  DatePickerInput,
  DismissibleTag,
  InlineNotification,
  Layer,
  Popover,
  PopoverContent,
  Stack,
} from '../Carbon';
import styles from './FeatureFlagsFilters.module.scss';
import submitFormAction from '../../utils/submitFormAction';

interface FeatureFlagFiltersProps {
  onApplyFilters: (data: Partial<ParsedFeatureFlagsFilterFormData>) => void;
  initialFilters: IFeatureFlagsFilters;
}

export function FeatureFlagsFilters({ onApplyFilters, initialFilters }: FeatureFlagFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialForm = {
    archived: initialFilters.archived,
    createdAtEndDate: initialFilters.createdAtEndDate,
    createdAtStartDate: initialFilters.createdAtStartDate,
    enabled: initialFilters.enabledIn,
    updatedAtEndDate: initialFilters.updatedAtEndDate,
    updatedAtStartDate: initialFilters.updatedAtStartDate,
    type: initialFilters.featureFlagTypes,
  };
  const initialState = {
    errorMessage: '',
    filterCount: flagsFiltersCount(initialFilters),
    form: initialForm,
    parsed: {},
    previousForm: initialForm,
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(parseFeatureFlagsFiltersFormData, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const createdAtsValue = [
    formState.form.createdAtStartDate ? format(formState.form.createdAtStartDate, dateFormat) : '',
    formState.form.createdAtEndDate ? format(formState.form.createdAtEndDate, dateFormat) : '',
  ];
  const updatedAtsValue = [
    formState.form.updatedAtStartDate ? format(formState.form.updatedAtStartDate, dateFormat) : '',
    formState.form.updatedAtEndDate ? format(formState.form.updatedAtEndDate, dateFormat) : '',
  ];

  function handleToggle() {
    if (!isOpen) {
      formRef.current?.reset();
      formAction(FormAction.RestoreForm);
    }

    setIsOpen(!isOpen);
  }

  function handleReset() {
    formRef.current?.reset();
    formAction(FormAction.ResetForm);
  }

  function handleRemoveFilters() {
    formAction(new FormData());
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    submitFormAction(event, formAction);
  }

  useEffect(() => {
    if (formState.status === ActionStatus.Success) {
      onApplyFilters(formState.parsed);
      setIsOpen(false);
      startTransition(() => {
        formAction(FormAction.ResetStatus);
      });
    }
  }, [formState.status, formState.parsed, onApplyFilters, formAction]);

  return (
    <Layer>
      <Popover open={isOpen} isTabTip align="bottom-end" className={styles.popover}>
        {formState.filterCount ? (
          <DismissibleTag
            className={styles.filterCount}
            onClose={handleRemoveFilters}
            size="lg"
            text={formState.filterCount}
            title={`Clear filter${formState.filterCount > 1 ? 's' : ''}`}
            type="high-contrast"
          />
        ) : null}
        <button
          aria-expanded={isOpen}
          aria-label="Filtering"
          className="cds--toolbar-action cds--overflow-menu"
          form="featureFlagsFilters"
          onClick={handleToggle}
          type="button"
        >
          <Filter />
        </button>
        <PopoverContent id="feature-flags-filters" className={styles.popoverContent}>
          <form ref={formRef} onSubmit={handleSubmit} name="featureFlagsFilters" id="featureFlagsFilters">
            <Stack className={styles.container} orientation="horizontal" gap={7}>
              <Stack gap={6}>
                <fieldset className="cds--fieldset">
                  <legend className="cds--label">Creation date</legend>
                  <DatePicker datePickerType="range" locale={{}}>
                    <DatePickerInput
                      // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                      autoComplete="off"
                      defaultValue={createdAtsValue[0]}
                      id="createdAtStartDate"
                      labelText="Start date"
                      name="createdAtStartDate"
                      placeholder="mm/dd/yyyy"
                      size="md"
                    />
                    <DatePickerInput
                      // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                      autoComplete="off"
                      defaultValue={createdAtsValue[1]}
                      id="createdAtEndDate"
                      labelText="End date"
                      name="createdAtEndDate"
                      placeholder="mm/dd/yyyy"
                      size="md"
                    />
                  </DatePicker>
                </fieldset>
                <fieldset className="cds--fieldset">
                  <legend className="cds--label">Last modified date</legend>
                  <DatePicker datePickerType="range" locale={{}}>
                    <DatePickerInput
                      // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                      autoComplete="off"
                      defaultValue={updatedAtsValue[0]}
                      id="updatedAtStartDate"
                      labelText="Start date"
                      name="updatedAtStartDate"
                      placeholder="mm/dd/yyyy"
                      size="md"
                    />
                    <DatePickerInput
                      // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                      autoComplete="off"
                      defaultValue={updatedAtsValue[1]}
                      id="updatedAtEndDate"
                      labelText="End date"
                      name="updatedAtEndDate"
                      placeholder="mm/dd/yyyy"
                      size="md"
                    />
                  </DatePicker>
                </fieldset>
              </Stack>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Type</legend>
                {Object.entries(featureFlagTypeLabels).map(([type, label]) => (
                  <Checkbox
                    defaultChecked={formState.form.type.includes(type as FeatureFlagType)}
                    id={type}
                    key={type}
                    labelText={label}
                    name="type"
                    value={type}
                  />
                ))}
              </fieldset>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Enabled in</legend>
                {Object.entries(environmentLabels).map(([type, label]) => (
                  <Checkbox
                    defaultChecked={formState.form.enabled.includes(type as EnvironmentKey)}
                    id={type}
                    key={type}
                    labelText={label}
                    name="enabled"
                    value={type}
                  />
                ))}
              </fieldset>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Status</legend>
                <Checkbox
                  defaultChecked={formState.form.archived}
                  id="archived"
                  labelText="Archived only"
                  name="archived"
                  value="true"
                />
              </fieldset>
            </Stack>
            {formState.status === ActionStatus.Error ? (
              <InlineNotification
                className={styles.error}
                hideCloseButton
                subtitle={formState.errorMessage}
                title="Error applying filters"
              />
            ) : null}
            <div>
              <Button kind="secondary" onClick={handleReset}>
                Reset filters
              </Button>
              <Button type="submit" kind="primary">
                Apply filters
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </Layer>
  );
}

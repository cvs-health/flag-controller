// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import type { ActionType, SubjectType, EnvironmentKey } from 'shared-types';
import { Filter } from '@carbon/icons-react';
import { format } from 'date-fns';
import { startTransition, useActionState, useEffect, useState } from 'react';

import parseLogFiltersFormData, { type ParsedLogFiltersFormData } from '../../actions/parseLogFiltersFormData';
import type { LogFilters as ILogFilters } from '../../typings/audits';
import { FormAction, ActionStatus, TimeRange } from '../../typings/common';
import {
  actionLabels,
  dateFormat,
  environmentLabels,
  subjectTypeLabels,
  timeRangeLabels,
} from '../../constants/common';
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
  Select,
  SelectItem,
  Stack,
} from '../Carbon';
import logFiltersCount from '../../utils/logFiltersCount';
import styles from './LogFilters.module.scss';

interface LogFiltersProps {
  initialFilters: ILogFilters;
  onApplyFilters: (data: Partial<ParsedLogFiltersFormData>) => void;
}

export function LogFilters({ onApplyFilters, initialFilters }: LogFiltersProps) {
  const initialForm = {
    action: initialFilters.actionTypes,
    actionEndDate: initialFilters.actionEndDate || '',
    actionStartDate: initialFilters.actionStartDate || '',
    environment: initialFilters.environmentKeys,
    subject: initialFilters.subjectTypes,
    timeRange: (initialFilters.timeRange as TimeRange) || TimeRange.None,
  };
  const initialState = {
    errorMessage: '',
    filterCount: logFiltersCount(initialFilters),
    form: initialForm,
    parsed: {},
    previousForm: initialForm,
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(parseLogFiltersFormData, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [timeRangeInputsVisible, setTimeRangeInputsVisible] = useState(formState.form.timeRange === TimeRange.Custom);
  const timeRangeDatesValue = [
    formState.form.actionStartDate ? format(formState.form.actionStartDate, dateFormat) : '',
    formState.form.actionEndDate ? format(formState.form.actionEndDate, dateFormat) : '',
  ];

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (isOpen) {
      const dateInputsVisible = formState.previousForm?.timeRange === TimeRange.Custom;

      if (dateInputsVisible !== timeRangeInputsVisible) {
        setTimeRangeInputsVisible(dateInputsVisible);
      }

      formAction(FormAction.RestoreForm);
    } else {
      event.preventDefault();
    }
    setIsOpen(!isOpen);
  }

  function handleReset() {
    if (isOpen) {
      setTimeRangeInputsVisible(false);
      formAction(FormAction.ResetForm);
    }
  }

  function handleTimeRangeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setTimeRangeInputsVisible(event.target.value === TimeRange.Custom);
  }

  function handleRemoveFilters() {
    formAction(new FormData());
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

  useEffect(() => {
    setTimeRangeInputsVisible(formState.form.timeRange === TimeRange.Custom);
  }, [formState.form.timeRange]);

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
          form="logFilters"
          onClick={handleToggle}
          type="reset"
        >
          <Filter />
        </button>
        <PopoverContent id="log-filters" className={styles.popoverContent}>
          <form action={formAction} name="logFilters" onReset={handleReset} id="logFilters">
            <Stack className={styles.container} orientation="horizontal" gap={7}>
              <Stack gap={6}>
                <fieldset className={classNames('cds--fieldset', styles.actionDate)}>
                  <legend className={classNames('cds--label', styles.legend)}>Action date</legend>
                  <Select
                    defaultValue={formState.form.timeRange}
                    id="timeRange"
                    key={formState.form.timeRange}
                    labelText="Time range"
                    name="timeRange"
                    onChange={handleTimeRangeChange}
                  >
                    {Object.entries(timeRangeLabels).map(([key, value]) => (
                      <SelectItem key={key} value={key} text={value} />
                    ))}
                  </Select>

                  {timeRangeInputsVisible ? (
                    <DatePicker
                      className={styles.datePicker}
                      datePickerType="range"
                      maxDate={format(Date.now(), dateFormat)}
                      value={timeRangeDatesValue}
                    >
                      <DatePickerInput
                        // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                        autoComplete="off"
                        id="actionStartDate"
                        labelText="Start date"
                        name="actionStartDate"
                        placeholder="mm/dd/yyyy"
                        size="md"
                      />
                      <DatePickerInput
                        // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                        autoComplete="off"
                        id="actionEndDate"
                        labelText="End date"
                        name="actionEndDate"
                        placeholder="mm/dd/yyyy"
                        size="md"
                      />
                    </DatePicker>
                  ) : null}
                </fieldset>
              </Stack>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Action type</legend>
                {Object.entries(actionLabels).map(([type, label]) => (
                  <Checkbox
                    defaultChecked={formState.form.action.includes(type as ActionType)}
                    id={type}
                    key={type}
                    labelText={label}
                    name="action"
                    value={type}
                  />
                ))}
              </fieldset>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Environment</legend>
                {Object.entries(environmentLabels).map(([type, label]) => (
                  <Checkbox
                    defaultChecked={formState.form.environment.includes(type as EnvironmentKey)}
                    id={type}
                    key={type}
                    labelText={label}
                    name="environment"
                    value={type}
                  />
                ))}
              </fieldset>
              <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
                <legend className="cds--label">Subject</legend>
                {Object.entries(subjectTypeLabels).map(([type, label]) => (
                  <Checkbox
                    defaultChecked={formState.form.subject.includes(type as SubjectType)}
                    id={type}
                    key={type}
                    labelText={label}
                    name="subject"
                    value={type}
                  />
                ))}
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
              <Button kind="secondary" type="reset">
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

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { type ChangeEvent, useState } from 'react';
import { Clause, Meridiem, Operator, RuleConditionType, type TimeZone } from 'shared-types';
import { Button, DatePicker, DatePickerInput, Select, SelectItem, Stack } from '@carbon/react';
import { SubtractAlt } from '@carbon/icons-react';
import { z } from 'zod';

import styles from './TimeRuleCondition.module.scss';
import type { RuleConditional } from '../../typings/rules';
import { dateFormat, ruleConditionalTranslation, timeOperatorTranslation } from '../../constants/common';
import { TimePicker } from '../TimePicker/TimePicker';
import { format } from 'date-fns';
import useInputValidation from '../../hooks/useInputValidation';

interface TimeRuleConditionProps {
  className?: string;
  conditional: RuleConditional;
  disabled?: boolean;
  endDate: string | null;
  endDateTimeZone?: TimeZone | null;
  id: string;
  onRemove: (id: string) => void;
  operator: Operator;
  ruleId: string;
  startDate: string | null;
  startDateTimeZone: TimeZone;
}

export function TimeRuleCondition({
  className = '',
  conditional,
  disabled = false,
  endDate,
  endDateTimeZone,
  id,
  onRemove,
  operator,
  ruleId,
  startDate,
  startDateTimeZone,
}: TimeRuleConditionProps) {
  const startDateInputValidation = useInputValidation({
    schema: z.string().min(1, 'Start date is required.'),
  });
  const endDateInputValidation = useInputValidation({
    schema: z.string().min(1, 'End date is required.'),
  });
  const [currentOperator, setCurrentOperator] = useState(operator);
  const startDateDate = startDate ? new Date(startDate) : new Date();
  const endDateDate = endDate ? new Date(endDate) : null;

  function handleOperatorChange(event: ChangeEvent<HTMLSelectElement>) {
    setCurrentOperator(event.target.value as Operator);
  }

  return (
    <div className={classNames(styles.root, className)}>
      <Stack gap={5}>
        <div className={styles.conditional}>
          {ruleConditionalTranslation[conditional]}
          {!disabled ? (
            <Button
              className={styles.remove}
              iconDescription="Remove condition"
              kind="danger--ghost"
              onClick={() => onRemove(id)}
              size="sm"
              renderIcon={SubtractAlt}
            >
              Remove condition
            </Button>
          ) : null}
        </div>
        <Select
          defaultValue={operator}
          labelText="Operator"
          name={`${id}-operator`}
          id={`${id}-operator`}
          onChange={handleOperatorChange}
          readOnly={disabled}
          required
        >
          {Object.entries(timeOperatorTranslation).map(([value, label]) => (
            <SelectItem value={value} text={label} key={value} />
          ))}
        </Select>
        <DatePicker datePickerType="single" locale="en" value={format(startDateDate, dateFormat)}>
          <DatePickerInput
            // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
            autoComplete="off"
            id={`${id}-start-date`}
            labelText={currentOperator === Operator.LessThanOrEqual ? 'Start Date' : 'Date'}
            placeholder="mm/dd/yyyy"
            name={`${id}-startDate`}
            invalid={!!startDateInputValidation.error}
            invalidText={startDateInputValidation.error}
            onBlur={startDateInputValidation.handleBlur}
            onChange={startDateInputValidation.handleChange}
            onInvalid={startDateInputValidation.handleInvalid}
            required
          />
        </DatePicker>
        <TimePicker
          label="Start time"
          name={`${id}-startDate`}
          defaultMeridiem={format(startDateDate, 'aa') as Meridiem}
          defaultTimeZone={startDateTimeZone}
          defaultTime={format(startDateDate, 'h:mm')}
          required
        />
        {currentOperator === Operator.LessThanOrEqual ? (
          <>
            <DatePicker datePickerType="single" locale="en" value={endDateDate ? format(endDateDate, dateFormat) : ''}>
              <DatePickerInput
                // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                autoComplete="off"
                id={`${id}-end-date`}
                labelText="End Date"
                placeholder="mm/dd/yyyy"
                name={`${id}-endDate`}
                invalid={!!endDateInputValidation.error}
                invalidText={endDateInputValidation.error}
                onBlur={endDateInputValidation.handleBlur}
                onChange={endDateInputValidation.handleChange}
                onInvalid={endDateInputValidation.handleInvalid}
                required
              />
            </DatePicker>
            <TimePicker
              label="End time"
              name={`${id}-endDate`}
              defaultMeridiem={endDateDate ? (format(endDateDate, 'aa') as Meridiem) : Meridiem.AM}
              defaultTimeZone={endDateTimeZone}
              defaultTime={endDateDate ? format(endDateDate, 'h:mm') : '12:00'}
              required
            />
          </>
        ) : null}
      </Stack>
      <input type="hidden" name={`${id}-clause`} value={Clause.And} />
      <input type="hidden" name={`${id}-conditionType`} value={RuleConditionType.Time} />
      <input type="hidden" name={`${ruleId}-conditionId`} value={id} />
    </div>
  );
}

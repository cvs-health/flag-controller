// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TimePicker as CarbonTimePicker, TimePickerSelect, SelectItem } from '@carbon/react';
import { Meridiem, TimeZone } from 'shared-types';
import { z } from 'zod';

import getTimeZoneOptions from '../../utils/getTimeZoneOptions';
import useInputValidation from '../../hooks/useInputValidation';

interface Change {
  time?: string;
  meridiem?: Meridiem;
  timezone?: TimeZone;
}

interface TimePickerProps {
  defaultMeridiem?: Meridiem;
  defaultTimeZone?: TimeZone | null;
  defaultTime?: string;
  name: string;
  label?: string;
  showUtcOffset?: boolean;
  onChange?: (value: Change) => void;
  required?: boolean;
}

export function TimePicker({
  defaultMeridiem = Meridiem.AM,
  defaultTimeZone = TimeZone.NewYork,
  defaultTime = '12:00',
  name,
  label = 'Time',
  showUtcOffset = true,
  onChange = () => {},
  required = false,
}: TimePickerProps) {
  const inputValidation = useInputValidation({
    schema: required ? z.string().min(1, `${label} is required.`) : undefined,
  });
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    inputValidation.handleChange(event);

    if (onChange) {
      const { name: fieldName, value } = event.target;

      if (fieldName === `${name}-time`) {
        onChange({ time: value });
      }

      if (fieldName === `${name}-meridiem`) {
        onChange({ meridiem: value as Meridiem });
      }

      if (fieldName === `${name}-timeZone`) {
        onChange({ timezone: value as TimeZone });
      }
    }
  }

  return (
    <CarbonTimePicker
      defaultValue={defaultTime}
      id={`${name}-time`}
      invalid={!!inputValidation.error}
      invalidText={inputValidation.error}
      labelText={label}
      // @ts-expect-error We need name, but the component does not have it defined as a prop
      name={`${name}-time`}
      onBlur={inputValidation.handleBlur}
      onChange={handleChange}
      onInvalid={inputValidation.handleInvalid}
      required={required}
    >
      <TimePickerSelect id={`${name}-meridiem`} defaultValue={defaultMeridiem} name={`${name}-meridiem`}>
        <SelectItem text={Meridiem.AM} value={Meridiem.AM} />
        <SelectItem text={Meridiem.PM} value={Meridiem.PM} />
      </TimePickerSelect>
      <TimePickerSelect
        id={`${name}-timeZone`}
        name={`${name}-timeZone`}
        defaultValue={defaultTimeZone || TimeZone.NewYork}
      >
        {getTimeZoneOptions(new Date(), showUtcOffset).map(({ value, text }) => (
          <SelectItem key={value} text={text} value={value} />
        ))}
      </TimePickerSelect>
    </CarbonTimePicker>
  );
}

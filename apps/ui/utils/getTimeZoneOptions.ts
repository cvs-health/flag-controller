// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { getTimezoneOffset } from 'date-fns-tz';
import { TIMEZONE_FRIENDLY_NAMES } from 'shared-constants';
import { TimeZone } from 'shared-types';

function getUtcOffsetLabel(timeZone: string, date = new Date()): string {
  const ms = getTimezoneOffset(timeZone, date);
  const totalMinutes = Math.trunc(ms / 60000);

  const sign = totalMinutes < 0 ? '-' : '+';
  const abs = Math.abs(totalMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');

  return `UTC ${sign} ${hh}:${mm}`;
}

export interface TimezoneOption {
  value: string;
  text: string;
}

function getTimeZoneOptions(date = new Date(), utcOffset = true): TimezoneOption[] {
  return Object.values(TimeZone).map((value) => ({
    value,
    text: `${TIMEZONE_FRIENDLY_NAMES[value as TimeZone]}${utcOffset ? ` (${getUtcOffsetLabel(value, date)})` : ''}`,
  }));
}

export default getTimeZoneOptions;

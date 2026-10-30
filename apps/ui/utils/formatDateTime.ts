// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { format, isToday } from 'date-fns';

import { dateFormat } from '../constants/common';

/**
 * Formats a date string into a more readable format.
 * If the date is today, it will return "Today at hh:mm a".
 * Otherwise, it will return "MM/dd/yyyy at hh:mm a".
 */
function formatDateTime(date: string) {
  return `${isToday(date) ? 'Today' : format(date, dateFormat)} at ${format(date, 'hh:mm a')}`;
}

export default formatDateTime;

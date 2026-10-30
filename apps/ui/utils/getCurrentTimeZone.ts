// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TimeZone } from 'shared-types';

function getCurrentTimeZone() {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return Object.values(TimeZone).includes(systemTimeZone as TimeZone) ? (systemTimeZone as TimeZone) : TimeZone.NewYork;
}

export default getCurrentTimeZone;

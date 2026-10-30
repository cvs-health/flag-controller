// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TimeZone } from 'shared-types';

export const TIMEZONE_FRIENDLY_NAMES: Record<TimeZone, string> = {
  [TimeZone.Anchorage]: 'AKST',
  [TimeZone.Chicago]: 'CST',
  [TimeZone.Denver]: 'MST',
  [TimeZone.LosAngeles]: 'PST',
  [TimeZone.NewYork]: 'EST',
  [TimeZone.Honolulu]: 'HST',
};

export const FLAGD_TIMESTAMP = '$flagd.timestamp';

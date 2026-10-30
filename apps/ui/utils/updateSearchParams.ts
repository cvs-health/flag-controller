// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Provides an updated search params string based on the current search params and the updates provided
 */
function updateSearchParams(searchParams: ReadonlyURLSearchParams | URLSearchParams, updates: [string, string][]) {
  const params = new URLSearchParams(searchParams.toString());

  updates.forEach(([name, value]) => {
    params.set(name, value);
  });

  return params.toString();
}

export default updateSearchParams;

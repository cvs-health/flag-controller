// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * Convert an object to a URLSearchParams string, setting array values as multiple parameters.
 */
function objectToSearchParams(object: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(object).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value as string);
    }
  });

  return params.toString();
}

export default objectToSearchParams;

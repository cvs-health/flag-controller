// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function tryJsonParse(value: unknown) {
  try {
    // @ts-expect-error We just want to try and parse the value
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

export default tryJsonParse;

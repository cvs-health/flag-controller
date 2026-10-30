// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function validJSONString(jsonString: string) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (_e) {
    return false;
  }
}

export default validJSONString;

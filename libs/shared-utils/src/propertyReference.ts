// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function propertyReference(...identifiers: string[]) {
  return identifiers.join('/');
}

export default propertyReference;

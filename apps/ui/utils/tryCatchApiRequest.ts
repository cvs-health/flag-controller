// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

async function tryCatchApiRequest<A>(apiRequest: Promise<A>): Promise<[A | undefined, unknown]> {
  try {
    const result = await apiRequest;
    return [result, undefined];
  } catch (error) {
    return [undefined, error];
  }
}

export default tryCatchApiRequest;

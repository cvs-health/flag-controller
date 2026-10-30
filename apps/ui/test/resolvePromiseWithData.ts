// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function resolvePromiseWithData<D>(data: D, ok = true, status = 200, errorMessage = '') {
  // @ts-expect-error We do not need to mock all of the properties
  return {
    ok,
    json: () => Promise.resolve(data),
    status,
    text: () => errorMessage,
  } as Response;
}

export default resolvePromiseWithData;

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function getSettledRequestErrorMessage<T>(results: PromiseSettledResult<T>[]) {
  const errorMessages = [];

  for (const result of results) {
    if (result.status !== 'rejected') {
      continue;
    }

    const reason = result.reason;
    const message = reason instanceof Error ? reason.message : String(reason ?? 'Request failed');

    errorMessages.push(message);
  }

  return errorMessages;
}

export default getSettledRequestErrorMessage;

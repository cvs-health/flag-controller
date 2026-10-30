// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { type ErrorCode, PROBLEM_STATUSES, PROBLEM_TITLES, PROBLEM_TYPES, type Problem } from 'shared-types';

/** A failed `fetch` Response whose body is an RFC 9457 problem document for `code`. */
function resolvePromiseWithProblem(code: ErrorCode, overrides: Partial<Omit<Problem, 'code'>> = {}) {
  const problem: Problem = {
    type: PROBLEM_TYPES[code],
    title: PROBLEM_TITLES[code],
    status: PROBLEM_STATUSES[code],
    code,
    ...overrides,
  };

  return {
    ok: false,
    status: problem.status,
    json: () => Promise.resolve(problem),
    text: () => Promise.resolve(JSON.stringify(problem)),
  } as unknown as Response;
}

export default resolvePromiseWithProblem;

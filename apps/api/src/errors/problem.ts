// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyReply } from 'fastify';
import { PROBLEM_CONTENT_TYPE, PROBLEM_TITLES, PROBLEM_TYPES, type Problem } from 'shared-types';

import type { AppError } from './AppError.js';

/** `context` and `cause` are deliberately absent: nothing internal can reach the wire. */
export function toProblem(error: AppError, instance?: string) {
  const problem: Problem = {
    type: PROBLEM_TYPES[error.code],
    title: PROBLEM_TITLES[error.code],
    status: error.status,
    code: error.code,
  };

  if (error.detail) {
    problem.detail = error.detail;
  }

  if (instance) {
    problem.instance = instance;
  }

  if (error.errors?.length) {
    problem.errors = error.errors;
  }

  return problem;
}

// Module-private so every response body goes through `toProblem`.
function sendProblem(reply: FastifyReply, problem: Problem) {
  return reply.code(problem.status).type(PROBLEM_CONTENT_TYPE).send(problem);
}

export function sendAppError(reply: FastifyReply, error: AppError, instance?: string) {
  return sendProblem(reply, toProblem(error, instance));
}

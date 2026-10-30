// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { notFound } from 'next/navigation';

import { ErrorCode } from 'shared-types';

import { isApiError } from './ApiError';

/**
 * For a server page whose primary fetch failed. A 404 renders the not-found page; anything else
 * reaches the nearest `error.tsx` boundary. Never returns.
 */
export function throwPageError(error: unknown): never {
  if (isApiError(error) && error.code === ErrorCode.NotFound) {
    notFound();
  }

  throw error;
}

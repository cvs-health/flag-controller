// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { headers } from 'next/headers';

import { apiErrorFromBody, apiErrorFromTransport } from './ApiError';

interface Options<B> extends Omit<RequestInit, 'body'> {
  body: B;
}

async function apiRequest<T, B = object>(url: string, options: Partial<Options<B>> = {}) {
  const body = options.body && JSON.stringify(options.body);
  const headersList = await headers();
  const cookie = headersList.get('cookie') || '';
  // fetch rejects (DNS, refused connection, timeout) rather than resolving with a status.
  let response: Response;

  try {
    response = await fetch(`${process.env.API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        cookie,
        ...options?.headers,
      },
      body,
    });
  } catch (cause) {
    throw apiErrorFromTransport(cause);
  }

  if (!response.ok) {
    throw apiErrorFromBody(response.status, await readBody(response));
  }

  if ([201, 204].includes(response.status)) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw apiErrorFromTransport(cause);
  }
}

/** An unreadable error body is still an error; fall back to the status rather than throwing here. */
async function readBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export default apiRequest;

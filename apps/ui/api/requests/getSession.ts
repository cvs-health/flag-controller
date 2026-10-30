// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuthSession } from '../../typings/common';
import { ErrorCode } from 'shared-types';
import apiRequest from '../../utils/apiRequest';
import { isApiError } from '../../utils/ApiError';

export const getSessionUrl = 'api/auth/get-session';

// We do not use Better Auth's helper methods directly here. On the Next.js
// server we need the full session from Better Auth's `/api/auth/get-session`
// endpoint, and the recommended integration is to make an HTTP request while
// forwarding the incoming cookie header. This keeps session validation in the
// Fastify auth service and avoids trying to run Better Auth server APIs inside
// the UI app.
async function getSession() {
  try {
    return await apiRequest<AuthSession>(getSessionUrl);
  } catch (error) {
    if (isApiError(error) && error.code === ErrorCode.Unauthorized) {
      return null;
    }

    throw error;
  }
}

export default getSession;

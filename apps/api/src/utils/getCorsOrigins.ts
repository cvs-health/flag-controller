// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * Returns an array of CORS origins based on the CORS_ORIGIN environment variable.
 */
export function getCorsOrigins(): string[] {
  const corsOriginEnv = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  return corsOriginEnv.split(',').map((origin) => origin.trim());
}

export default getCorsOrigins;

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * Type guard to check if an error is a PostgreSQL unique constraint violation.
 *
 * Error code 23505 indicates a unique constraint violation - when an INSERT or UPDATE
 * operation attempts to create a duplicate value in a column or set of columns that
 * have a UNIQUE constraint defined.
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html#:~:text=foreign_key_violation-,23505,-unique_violation
 * @param err - The error to check
 * @returns true if the error is a unique constraint violation (code 23505)
 */
const PG_UNIQUE_VIOLATION = '23505' as const;
export function isUniqueViolation(err: unknown) {
  return hasPgErrorCode(err, PG_UNIQUE_VIOLATION);
}

/**
 * Type guard to check if an error is a PostgreSQL foreign key violation.
 *
 * Error code 23503 indicates a foreign key violation - when an INSERT or UPDATE
 * operation references a value that does not exist in the referenced table.
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 * @param err - The error to check
 * @returns true if the error is a foreign key violation (code 23503)
 */
const PG_FOREIGN_KEY_VIOLATION = '23503' as const;
export function isForeignKeyViolation(err: unknown) {
  return hasPgErrorCode(err, PG_FOREIGN_KEY_VIOLATION);
}

// Drizzle wraps driver errors in DrizzleQueryError, so the pg code lives on the cause chain.
function hasPgErrorCode(err: unknown, code: string) {
  let current = err;

  while (current instanceof Error) {
    if ('code' in current && current.code === code) {
      return true;
    }

    current = current.cause;
  }

  return false;
}

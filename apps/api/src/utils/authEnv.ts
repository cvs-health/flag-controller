// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export function fail(message: string): never {
  throw new Error(`Invalid auth configuration: ${message}`);
}

export function readEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

export function readList(name: string) {
  return readEnv(name)
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function readBoolean(name: string, fallback: boolean) {
  const value = readEnv(name);

  if (value === undefined) {
    return fallback;
  }
  if (value !== 'true' && value !== 'false') {
    fail(`${name} must be true or false, got "${value}"`);
  }

  return value === 'true';
}

export function readChoice<T extends string>(name: string, choices: readonly T[], fallback: T) {
  const value = readEnv(name) ?? fallback;

  if (!choices.includes(value as T)) {
    fail(`${name} must be one of ${choices.join(', ')}, got "${value}"`);
  }

  return value as T;
}

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { MockedFunction } from 'vitest';

export type MockFn<T> = T extends (...args: never[]) => unknown ? MockedFunction<T> : never;

export type MockedMethods<T> = {
  [K in keyof T]: MockFn<T[K]>;
};

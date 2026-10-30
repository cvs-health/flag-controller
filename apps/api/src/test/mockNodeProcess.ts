// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * @file testing utilities taken from https://github.com/leonsilicon/vitest-mock-process/tree/main?tab=readme-ov-file
 * It was easier to just copy what I needed, in the future we may want to import the whole library or fork it ourselves and publish it internally
 */
// @ts-nocheck - External utility with complex generics that don't align with vitest's types

import { vi } from 'vitest';

const maybeMockRestore = (a: any): void =>
  a.mockRestore && typeof a.mockRestore === 'function' ? a.mockRestore() : undefined;

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
	Helper function for manually creating new spy mocks of functions not supported by this module.

	@param target Object containing the function that will be mocked.
	@param property Name of the function that will be mocked.
	@param impl Mock implementation of the target's function. The return type must match the target function's.
*/
export function spyOnImplementing<
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object,
  M extends FunctionPropertyNames<T>,
  F extends T[M] extends (...args: any[]) => any ? T[M] : never,
  I extends (...args: any[]) => ReturnType<F>,
>(target: T, property: M, impl: I) {
  maybeMockRestore(target[property]);
  const mock = vi.spyOn(target, property as any).mockImplementation(impl);
  return mock as any;
}

/**
	Helper function to create a mock of the Node.js method `process.exit(code: number)`.

	@param err Optional error to raise. If unspecified or falsy, calling `process.exit` will resume code execution instead of raising an error.
*/
export const mockProcessExit = (err?: any) =>
  spyOnImplementing(
    process,
    'exit',
    (err
      ? () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw err;
        }
      : () => {
          /* noop */
        }) as () => never,
  );

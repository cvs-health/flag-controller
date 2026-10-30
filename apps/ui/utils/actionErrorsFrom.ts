// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { isApiError } from './ApiError';
import type { ActionErrorPresentation, ActionErrors } from '../typings/common';

/**
 * Turns a caught action error into the `ActionErrors` shape the forms already render: field errors
 * from `Problem.errors[]` land in `fieldErrors` next to the zod ones; the safe message is the banner.
 * `fieldMap` renames API field names to form field names where they differ.
 */
export function actionErrorsFrom<S>(
  error: unknown,
  presentation: Pick<ActionErrorPresentation, 'title'>,
  fieldMap: Record<string, keyof S & string> = {},
): ActionErrors<S> {
  if (!isApiError(error)) {
    return { actionError: { ...presentation, subtitle: 'Something went wrong on our end. Try again in a moment.' } };
  }

  const fieldErrors = fieldErrorsFrom(error.fieldErrors, fieldMap);

  return {
    ...(fieldErrors ? { fieldErrors } : {}),
    actionError: { ...presentation, subtitle: error.message },
  } as ActionErrors<S>;
}

function fieldErrorsFrom(errors: { field: string; detail?: string; code: string }[], fieldMap: Record<string, string>) {
  if (!errors.length) {
    return undefined;
  }

  return errors.reduce<Record<string, string[]>>((acc, { field, detail, code }) => {
    const formField = fieldMap[field] ?? field;
    const messages = acc[formField] ?? [];

    messages.push(detail ?? FIELD_MESSAGES[code] ?? 'This value is not valid.');
    acc[formField] = messages;

    return acc;
  }, {});
}

const FIELD_MESSAGES: Record<string, string> = {
  REQUIRED: 'This field is required.',
  INVALID: 'This value is not valid.',
  DUPLICATE: 'This value is already in use.',
  NOT_FOUND: 'This value does not refer to anything that exists.',
  TOO_LONG: 'This value is too long.',
  TOO_SHORT: 'This value is too short.',
  OUT_OF_RANGE: 'This value is out of range.',
};

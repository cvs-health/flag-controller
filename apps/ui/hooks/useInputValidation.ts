// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { type ChangeEvent, type FocusEvent, type SyntheticEvent, useEffect, useState } from 'react';
import type { z } from 'zod';

type ValidatableFormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface Config<E extends ValidatableFormElement = ValidatableFormElement> {
  onChange?: (currentTarget: EventTarget & E, formData: FormData) => undefined | string;
  onBlur?: (currentTarget: EventTarget & E, formData: FormData) => undefined | string;
  serverError?: string | string[];
  schema?: z.ZodType<unknown, string>;
}

/**
 * Custom hook for input validation.
 *
 * @param config - Schema-based native validation and optional custom blur/change validation.
 * @returns Event handlers and the current validation error.
 */
function useInputValidation<E extends ValidatableFormElement = ValidatableFormElement>({
  onChange,
  onBlur,
  serverError,
  schema,
}: Config<E>) {
  const [validationError, setValidationError] = useState('');
  const normalizedServerError = Array.isArray(serverError) ? serverError.join(' ') : serverError;
  const [currentServerError, setCurrentServerError] = useState(normalizedServerError);
  const error = validationError || currentServerError || '';

  function getSchemaError(value: string) {
    const result = schema?.safeParse(value);

    return result && !result.success ? result.error.issues[0]?.message : undefined;
  }

  function handleInvalid(event: SyntheticEvent<E>) {
    event.preventDefault();
    const message = getSchemaError(event.currentTarget.value) || event.currentTarget.validationMessage;

    setValidationError(message);
  }

  function handleBlur(event: FocusEvent<E>) {
    if (!event.currentTarget.checkValidity()) {
      return;
    }

    const formData = new FormData(event.currentTarget.form || undefined);
    const message = onBlur?.(event.currentTarget, formData) || getSchemaError(event.currentTarget.value) || '';

    setValidationError(message);

    if (!message) {
      setCurrentServerError(undefined);
    }
  }

  function handleChange(event?: ChangeEvent<E>, value?: string) {
    if (event && !event.currentTarget.validity.valid) {
      return;
    }

    const currentValue = value ?? event?.currentTarget.value;

    if (currentValue === undefined) {
      return;
    }

    const formData = event ? new FormData(event.currentTarget.form || undefined) : undefined;
    const message =
      (event && formData ? onChange?.(event.currentTarget, formData) : undefined) || getSchemaError(currentValue) || '';

    setValidationError(message);

    if (!message) {
      setCurrentServerError(undefined);
    }
  }

  useEffect(() => {
    setCurrentServerError(normalizedServerError);
  }, [normalizedServerError]);

  return {
    handleBlur,
    handleChange,
    handleInvalid,
    error,
    validationError,
  };
}

export default useInputValidation;

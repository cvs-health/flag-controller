// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import useInputValidation from '../useInputValidation';

describe('useInputValidation', () => {
  it('uses the browser validation message when the validator returns no error', () => {
    const { result } = renderHook(() => useInputValidation({ schema: z.string() }));

    render(<input onInvalid={result.current.handleInvalid} required />);

    const input = screen.getByRole<HTMLInputElement>('textbox');

    fireEvent.invalid(input);

    expect(result.current.validationError).toBe(input.validationMessage);
  });

  it('clears the error on blur when the input is valid', () => {
    const { result } = renderHook(() => useInputValidation({ schema: z.string().min(1, 'Invalid input') }));

    render(<input onBlur={result.current.handleBlur} onInvalid={result.current.handleInvalid} required />);

    const input = screen.getByRole<HTMLInputElement>('textbox');

    fireEvent.invalid(input);
    fireEvent.change(input, { target: { value: 'valid' } });
    fireEvent.blur(input);

    expect(result.current.validationError).toBe('');
  });

  it('replaces the server error with an invalid client error and clears it once the input is valid', () => {
    const { result } = renderHook(() =>
      useInputValidation({ schema: z.string().min(1, 'Client error'), serverError: 'Server error' }),
    );

    expect(result.current.error).toBe('Server error');

    render(<input onChange={result.current.handleChange} onInvalid={result.current.handleInvalid} required />);

    const input = screen.getByRole('textbox');

    fireEvent.invalid(input);

    expect(result.current.error).toBe('Client error');

    fireEvent.change(input, { target: { value: 'valid' } });

    expect(result.current.error).toBe('');
  });

  it('joins server error messages', () => {
    const { result } = renderHook(() => useInputValidation({ serverError: ['First error', 'Second error'] }));

    expect(result.current.error).toBe('First error Second error');
  });

  it('displays a new server error after clearing a prior one', () => {
    const { result, rerender } = renderHook(
      ({ serverError }) => useInputValidation({ schema: z.string().min(1, 'Invalid input'), serverError }),
      { initialProps: { serverError: 'First server error' } },
    );

    render(<input onChange={result.current.handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'valid' } });

    expect(result.current.error).toBe('');

    rerender({ serverError: 'Second server error' });

    expect(result.current.error).toBe('Second server error');
  });

  it('clears the error on change when the input is valid', () => {
    const { result } = renderHook(() => useInputValidation({ schema: z.string().min(1, 'Invalid input') }));

    render(<input onChange={result.current.handleChange} onInvalid={result.current.handleInvalid} required />);

    const input = screen.getByRole<HTMLInputElement>('textbox');

    fireEvent.invalid(input);
    fireEvent.change(input, { target: { value: 'valid' } });

    expect(result.current.validationError).toBe('');
  });

  it('uses the custom validation message on a valid change', () => {
    const onChange = vi.fn(() => 'Duplicate value');
    const { result } = renderHook(() => useInputValidation({ schema: z.string().min(1, 'Invalid input'), onChange }));

    render(<input onChange={result.current.handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'duplicate' } });

    expect(onChange).toHaveBeenCalledOnce();
    expect(result.current.validationError).toBe('Duplicate value');
  });

  it('uses the custom blur message when onBlur returns one', () => {
    const onBlur = vi.fn(() => 'Duplicate value');
    const { result } = renderHook(() => useInputValidation({ schema: z.string().min(1, 'Invalid input'), onBlur }));

    render(<input onBlur={result.current.handleBlur} />);

    fireEvent.blur(screen.getByRole('textbox'));

    expect(onBlur).toHaveBeenCalledOnce();
    expect(result.current.validationError).toBe('Duplicate value');
  });

  it('clears the error when onBlur returns no message', () => {
    const { result } = renderHook(() =>
      useInputValidation({ schema: z.string().min(1, 'Invalid input'), onBlur: () => undefined }),
    );

    render(<input onBlur={result.current.handleBlur} onInvalid={result.current.handleInvalid} required />);

    const input = screen.getByRole<HTMLInputElement>('textbox');
    fireEvent.invalid(input);
    fireEvent.change(input, { target: { value: 'valid' } });
    fireEvent.blur(input);

    expect(result.current.validationError).toBe('');
  });

  it('validates a raw value and clears the server error once it is valid', () => {
    const { result } = renderHook(() =>
      useInputValidation({ schema: z.string().min(1, 'Invalid input'), serverError: 'Server error' }),
    );

    expect(result.current.error).toBe('Server error');

    // Fields without a native form control, such as the JSON editor, report their value with no event
    act(() => result.current.handleChange(undefined, ''));

    expect(result.current.error).toBe('Invalid input');

    act(() => result.current.handleChange(undefined, 'valid'));

    expect(result.current.error).toBe('');
  });

  it('does not run onBlur or clear the error when native validity fails', () => {
    const onBlur = vi.fn(() => 'Duplicate value');
    const { result } = renderHook(() => useInputValidation({ schema: z.string().min(1, 'Invalid input'), onBlur }));

    render(<input onBlur={result.current.handleBlur} onInvalid={result.current.handleInvalid} required />);
    const input = screen.getByRole<HTMLInputElement>('textbox');

    fireEvent.invalid(input);
    fireEvent.blur(input);

    expect(input.checkValidity()).toBe(false);
    expect(onBlur).not.toHaveBeenCalled();
    expect(result.current.validationError).toBe('Invalid input');
  });
});

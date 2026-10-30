// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TimePicker } from '../TimePicker';

describe('TimePicker', () => {
  it('should call onChange when the time changes', () => {
    const onChange = vi.fn();

    render(<TimePicker name="rule" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '10:30' } });

    expect(onChange).toHaveBeenCalledExactlyOnceWith({ time: '10:30' });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { JSONInput } from '../JSONInput';

describe('JSONInput', () => {
  it('mirrors the edited value to the form field and reports the change', async () => {
    const onChange = vi.fn();

    render(<JSONInput defaultValue="{}" id="value" labelText="Value" name="value" onChange={onChange} />);

    // The editor is not a form control, so its value reaches the form through a hidden input
    expect(screen.getByDisplayValue('{}')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Value'), 'not valid json');

    expect(onChange).toHaveBeenLastCalledWith('not valid json{}');
    expect(screen.getByDisplayValue('not valid json{}')).toBeInTheDocument();
  });

  it('marks an invalid field with an icon inside the editor', () => {
    // The icon is aria-hidden, so there is no query for it; screen readers get the message below the editor
    const { container, rerender } = render(<JSONInput id="value" labelText="Value" name="value" />);

    expect(container.querySelector('svg')).toBeNull();

    rerender(<JSONInput id="value" invalid invalidText="Must be valid JSON." labelText="Value" name="value" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the helper text until the field is invalid', () => {
    const { rerender } = render(
      <JSONInput helperText="Must be valid JSON" id="value" labelText="Value" name="value" />,
    );

    expect(screen.getByText('Must be valid JSON')).toBeInTheDocument();

    rerender(
      <JSONInput
        helperText="Must be valid JSON"
        id="value"
        invalid
        invalidText="Must be valid JSON."
        labelText="Value"
        name="value"
      />,
    );

    expect(screen.getByText('Must be valid JSON.')).toBeInTheDocument();
    expect(screen.queryByText('Must be valid JSON')).not.toBeInTheDocument();
  });

  // The editor is only reconfigured when the extensions array changes identity, so these have to track the props
  it('exposes the validation state and message to screen readers', () => {
    const { rerender } = render(
      <JSONInput helperText="Must be valid JSON" id="value" labelText="Value" name="value" />,
    );

    const editor = screen.getByLabelText('Value');

    expect(editor).not.toHaveAttribute('aria-invalid');
    expect(editor).toHaveAttribute('aria-describedby', 'value-helper-text');
    expect(screen.getByText('Must be valid JSON')).toHaveAttribute('id', 'value-helper-text');

    rerender(
      <JSONInput
        helperText="Must be valid JSON"
        id="value"
        invalid
        invalidText="Must be valid JSON."
        labelText="Value"
        name="value"
      />,
    );

    expect(editor).toHaveAttribute('aria-invalid', 'true');
    expect(editor).toHaveAttribute('aria-describedby', 'value-error-msg');
    expect(screen.getByText('Must be valid JSON.')).toHaveAttribute('id', 'value-error-msg');
  });

  it('describes nothing when the field has neither helper text nor an error', () => {
    render(<JSONInput id="value" labelText="Value" name="value" />);

    expect(screen.getByLabelText('Value')).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a read only value editable only by the form, not the user', async () => {
    render(<JSONInput defaultValue='{"a":1}' id="value" labelText="Value" name="value" readOnly />);

    await userEvent.type(screen.getByLabelText('Value'), 'edit');

    expect(screen.getByDisplayValue('{"a":1}')).toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActionStatus } from '../../../typings/common';
import { UnsavedChangesModal } from '../UnsavedChangesModal';

describe('UnsavedChangesModal', () => {
  it('handles actions', async () => {
    const props = {
      body: 'You have unsaved changes. Are you sure you want to continue?',
      onClose: vi.fn(),
      onPrimaryAction: vi.fn(),
      onPrimaryActionDone: vi.fn(),
      onSecondaryAction: vi.fn(),
      open: true,
      primaryActionLabel: 'Save and Continue',
      primaryActionStatus: ActionStatus.Idle,
      secondaryActionLabel: 'Discard Changes',
      title: 'Unsaved Changes',
    };

    render(
      <form>
        <UnsavedChangesModal {...props} />
      </form>,
    );

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.body)).toBeInTheDocument();
    expect(screen.getByText(props.secondaryActionLabel)).toBeInTheDocument();
    expect(screen.getByText(props.primaryActionLabel)).toBeInTheDocument();

    await userEvent.click(screen.getByText(props.secondaryActionLabel));

    expect(props.onSecondaryAction).toHaveBeenCalledOnce;

    await userEvent.click(screen.getByText('Save and Continue'));

    expect(props.onPrimaryAction).toHaveBeenCalledOnce();
  });
});

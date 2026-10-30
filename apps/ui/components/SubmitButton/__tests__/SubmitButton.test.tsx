// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SubmitButton } from '../SubmitButton';
import { ActionStatus } from '../../../typings/common';

const mocks = vi.hoisted(() => {
  return {
    pending: false,
  };
});

vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: mocks.pending,
  })),
}));

describe('SubmitButton', () => {
  it('should render as loading based on the form status', () => {
    mocks.pending = true;

    render(<SubmitButton label={{ [ActionStatus.Idle]: 'Submit' }} status={ActionStatus.Pending} />);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('should render as success', () => {
    mocks.pending = false;

    render(<SubmitButton label={{ [ActionStatus.Idle]: 'Submit' }} status={ActionStatus.Success} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should render as error', () => {
    mocks.pending = false;

    render(<SubmitButton label={{ [ActionStatus.Idle]: 'Submit' }} status={ActionStatus.Error} />);

    expect(screen.getByText('Submission error')).toBeInTheDocument();
  });
});

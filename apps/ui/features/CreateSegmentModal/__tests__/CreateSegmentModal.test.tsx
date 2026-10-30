// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { CreateSegmentModal } from '../CreateSegmentModal';

const mocks = vi.hoisted(() => ({
  serverStatus: 'idle',
  errors: undefined as { fieldErrors?: Record<string, string[]> } | undefined,
  form: {
    applicationId: '',
    description: '',
    key: '',
  },
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action, initialActionState) => [
    { ...initialActionState, form: mocks.form, status: mocks.serverStatus, errors: mocks.errors },
    (formData: FormData) => action(initialActionState, formData),
  ]),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));

describe('CreateSegmentModal', () => {
  beforeEach(() => {
    mocks.serverStatus = 'idle';
    mocks.errors = undefined;
    mocks.form = { applicationId: '', description: '', key: '' };
  });

  it('should handle the creation of a segment', async () => {
    const application = {
      id: '1',
      name: 'codenamekidsnextdoor',
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(resolvePromiseWithData({ data: [application] }));

    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const data = {
      applicationId: application.id,
      key: 'key',
      description: 'description',
    };

    render(<CreateSegmentModal onClose={onClose} open onSuccess={onSuccess} />, { wrapper: TestQueryClientProvider });

    await userEvent.type(screen.getByLabelText('Segment key'), data.key);
    await userEvent.type(screen.getByLabelText('Description'), data.description);
    await userEvent.selectOptions(screen.getByLabelText('Application'), application.id);

    expect(Object.fromEntries(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual(data);
  });

  it('should handle api error when creating a segment', async () => {
    mocks.serverStatus = 'error';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [{ id: '1', name: 'codenamekidsnextdoor' }] }),
    );

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateSegmentModal onClose={onClose} open onSuccess={onSuccess} />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('Failed to create segment')).toBeInTheDocument();
  });

  // The API binds a duplicate-key conflict to `key`; the field has to show it and drop it on edit.
  it('shows an API field error on the key input and clears it once the key changes', async () => {
    mocks.serverStatus = 'error';
    mocks.errors = { fieldErrors: { key: ['This value is already in use.'] } };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [{ id: '1', name: 'codenamekidsnextdoor' }] }),
    );

    render(<CreateSegmentModal onClose={vi.fn()} open onSuccess={vi.fn()} />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('This value is already in use.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Segment key'), 'a-free-key');

    expect(screen.queryByText('This value is already in use.')).not.toBeInTheDocument();
  });

  it('fills the fields from the values the action returned', async () => {
    mocks.serverStatus = 'error';
    mocks.form = { applicationId: '1', description: 'a description', key: 'taken-key' };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [{ id: '1', name: 'codenamekidsnextdoor' }] }),
    );

    render(<CreateSegmentModal onClose={vi.fn()} open onSuccess={vi.fn()} />, { wrapper: TestQueryClientProvider });

    expect(screen.getByLabelText('Segment key')).toHaveValue('taken-key');
    expect(screen.getByLabelText('Description')).toHaveValue('a description');
  });

  it('should display an error if the user has no applications available', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(resolvePromiseWithData({ data: [] }));

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateSegmentModal onClose={onClose} open onSuccess={onSuccess} />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('An application is required in order to create a segment')).toBeInTheDocument();
  });
});

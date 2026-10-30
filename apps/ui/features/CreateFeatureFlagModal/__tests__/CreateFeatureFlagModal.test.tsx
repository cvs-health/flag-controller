// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { ActionStatus } from '../../../typings/common';
import { CreateFeatureFlagModal } from '../CreateFeatureFlagModal';

const mocks = vi.hoisted(() => ({
  applications: ['codenamekidsnextdoor'],
  push: vi.fn(),
  formState: {},
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [mocks.formState, (formData: FormData) => action(formData)]),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));

describe('CreateFeatureFlagModal', () => {
  const applicationId = 'application-id';

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [{ id: applicationId, name: 'codenamekidsnextdoor' }], metadata: {} }),
    );
  });

  it('should handle the creation of a boolean flag', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const data = {
      applicationId,
      key: 'feature-flag-key',
      variationKey1: 'enabled',
      variationValue1: 'true',
      variationKey2: 'disabled',
      variationValue2: 'false',
      description: 'description',
      defaultVariationKey: 'enabled',
      type: FeatureFlagType.Boolean,
    };

    render(<CreateFeatureFlagModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    await userEvent.type(screen.getByLabelText('Flag Key'), data.key);
    await userEvent.type(screen.getByLabelText('Description'), data.description);
    await userEvent.selectOptions(screen.getByLabelText('Type'), data.type);

    expect(Object.fromEntries(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual(data);
  });

  it('should handle the creation of an object flag', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [{ id: applicationId, name: 'codenamekidsnextdoor' }], metadata: {} }),
    );

    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const data = {
      applicationId,
      key: 'feature-flag-key',
      variationKey1: 'enabled',
      variationValue1: '{}',
      variationKey2: 'disabled',
      variationValue2: '{}',
      description: 'description',
      defaultVariationKey: 'enabled',
      type: FeatureFlagType.Object,
    };

    render(<CreateFeatureFlagModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    await userEvent.type(screen.getByLabelText('Flag Key'), data.key);
    await userEvent.type(screen.getByLabelText('Description'), data.description);
    await userEvent.selectOptions(screen.getByLabelText('Type'), data.type);

    // The value fields are JSON editors rather than native inputs, so their values reach the form through hidden inputs
    expect(Object.fromEntries(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual(data);
    expect(screen.queryByText('Must be a valid JSON.')).toBeNull();

    const [firstVariationValueEditor] = screen.getAllByLabelText('Value (JSON)');

    if (firstVariationValueEditor) {
      await userEvent.type(firstVariationValueEditor, 'not valid json');
    }

    expect(screen.getByText('Must be a valid JSON object.')).toBeInTheDocument();
    expect(Object.fromEntries(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual({
      ...data,
      variationValue1: 'not valid json{}',
    });
  });

  it('updates default variation options when a variation key changes', async () => {
    render(<CreateFeatureFlagModal onClose={vi.fn()} open onSuccess={vi.fn()} />, {
      wrapper: TestQueryClientProvider,
    });

    const keyInputs = screen.getAllByLabelText('Key');
    const firstVariationKey = keyInputs[0];

    if (!firstVariationKey) throw new Error('Expected the first variation key input.');

    await userEvent.clear(firstVariationKey);
    await userEvent.type(firstVariationKey, 'on');

    expect(screen.getByRole('option', { name: 'on' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'enabled' })).not.toBeInTheDocument();
  });

  it('should display submission error', async () => {
    mocks.formState = {
      status: ActionStatus.Error,
      errorMessage: '',
      errors: {
        actionError: {
          title: 'System error',
          subtitle: 'Error message',
        },
      },
    };
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateFeatureFlagModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    expect(screen.getByText('System error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  // The API binds a duplicate-key conflict to `key`; the field has to show it and drop it on edit.
  it('shows an API field error on the key input and clears it once the key changes', async () => {
    mocks.formState = {
      status: ActionStatus.Error,
      errors: { fieldErrors: { key: ['This value is already in use.'] } },
    };

    render(<CreateFeatureFlagModal onClose={vi.fn()} open onSuccess={vi.fn()} />, {
      wrapper: TestQueryClientProvider,
    });

    expect(screen.getByText('This value is already in use.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Flag Key'), 'a-free-key');

    expect(screen.queryByText('This value is already in use.')).not.toBeInTheDocument();
  });

  it('should display an error if the user has no applications available', async () => {
    mocks.applications = [];
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateFeatureFlagModal onClose={onClose} open onSuccess={onSuccess} />, {
      wrapper: TestQueryClientProvider,
    });

    expect(screen.getByText('An application is required in order to create a flag')).toBeInTheDocument();
  });
});

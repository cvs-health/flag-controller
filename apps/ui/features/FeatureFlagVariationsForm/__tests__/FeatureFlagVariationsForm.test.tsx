// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { FeatureFlagVariationsForm } from '../FeatureFlagVariationsForm';
import { FormAction, ActionStatus } from '../../../typings/common';

const mocks = vi.hoisted(() => ({
  state: { status: 'idle', error: '' },
  dispatch: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(() => ({
    pending: false,
  })),
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((action) => [mocks.state, (formData: FormData) => mocks.dispatch(action, formData)]),
}));

describe('FeatureFlagVariationsForm', () => {
  it('should handle the addition and removal of a variation', async () => {
    const variation = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'first',
      updatedAt: '',
      value: 'first value',
    };
    const variation2 = {
      ...variation,
      id: 'variation-id-2',
      key: 'second',
      value: 'second value',
    };

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.String}
          existingVariations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Add variation'));

    expect(screen.getByDisplayValue('new-variation-3')).toBeVisible();

    const [, removeVariationButton] = screen.getAllByText('Remove variation');

    if (removeVariationButton) {
      await userEvent.click(removeVariationButton);
    }

    expect(screen.queryByDisplayValue('second value')).not.toBeVisible();
  });

  it('should remove an unsaved variation from the form rather than queueing it for deletion', async () => {
    const variation = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'first',
      updatedAt: '',
      value: 'first value',
    };
    const variation2 = {
      ...variation,
      id: 'variation-id-2',
      key: 'second',
      value: 'second value',
    };

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.String}
          existingVariations={[variation, variation2]}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByText('Add variation'));

    const addedVariationRemoveButton = screen.getAllByText('Remove variation').at(-1);
    expect(addedVariationRemoveButton).toBeVisible();

    if (addedVariationRemoveButton) {
      await userEvent.click(addedVariationRemoveButton);
    }

    // Confirms removed from dom, not hidden
    expect(screen.queryByDisplayValue('new-variation-3')).not.toBeInTheDocument();
  });

  it('should not allow the value of a boolean variation to be edited', () => {
    mocks.state = { status: ActionStatus.Idle, error: '' };

    const variation = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'enabled',
      updatedAt: '',
      value: true,
    };
    const variation2 = {
      ...variation,
      id: 'variation-id-2',
      key: 'disabled',
      value: false,
    };

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.Boolean}
          existingVariations={[variation, variation2]}
        />
      </TestProviders>,
    );

    const [trueValueInput, falseValueInput] = screen.getAllByLabelText('Value');

    expect(trueValueInput).toHaveValue('true');
    expect(trueValueInput).toHaveAttribute('readonly');
    expect(falseValueInput).toHaveValue('false');
    expect(falseValueInput).toHaveAttribute('readonly');

    for (const keyInput of screen.getAllByLabelText('Key')) {
      expect(keyInput).not.toHaveAttribute('readonly');
    }
  });

  it('should edit the value of a json variation in a json editor', async () => {
    mocks.state = { status: ActionStatus.Idle, error: '' };

    const variation = {
      applicationName: 'applicationName',
      createdAt: '',
      deletedAt: null,
      flagId: 'flag-id',
      flagKey: 'featureFlagKey',
      id: 'variation-id',
      key: 'first',
      updatedAt: '',
      value: { enabled: true },
    };
    const variation2 = {
      ...variation,
      id: 'variation-id-2',
      key: 'second',
      value: { enabled: false },
    };

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.Object}
          existingVariations={[variation, variation2]}
        />
      </TestProviders>,
    );

    // The editor value reaches the form through a hidden input, formatted for readability
    expect(document.querySelectorAll<HTMLInputElement>('input[name="value"]')[0]).toHaveValue(
      JSON.stringify(variation.value, null, 2),
    );

    const [firstValueEditor] = screen.getAllByLabelText('Value');

    if (firstValueEditor) {
      await userEvent.type(firstValueEditor, 'not valid json');
    }

    expect(screen.getByText('Must be a valid JSON object.')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('should handle an error when saving changes', async () => {
    mocks.state = { status: ActionStatus.Error, error: 'Error' };

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.String}
          existingVariations={[]}
        />
      </TestProviders>,
    );

    expect(await screen.findByText('Failed to save changes')).toBeInTheDocument();
  });

  it('should handle success state', async () => {
    mocks.state = {
      status: ActionStatus.Success,
      error: '',
    };
    mocks.dispatch = vi.fn();

    render(
      <TestProviders>
        <FeatureFlagVariationsForm
          applicationName="applicationName"
          featureFlagId="flag-id"
          featureFlagKey="featureFlagKey"
          featureFlagType={FeatureFlagType.String}
          existingVariations={[]}
        />
      </TestProviders>,
    );

    expect(mocks.dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function), FormAction.ResetStatus);
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { FeatureFlagType } from 'shared-types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { RunEvaluations } from '../RunEvaluations';

describe('RunEvaluations', () => {
  const applicationId = 'application-id';
  const featureFlagKey = 'feature-flag-key';
  const featureFlag = {
    defaultVariation: 'enabled',
    type: FeatureFlagType.Boolean,
  };
  const variation = {
    id: 'variation-1',
    key: 'enabled',
    createdAt: '',
    deletedAt: null,
    flagId: 'feature-flag-id',
    updatedAt: '',
    flagKey: featureFlagKey,
    value: true,
  };

  it('handles an evaluation', async () => {
    render(
      <TestProviders>
        <form>
          <RunEvaluations
            applicationId={applicationId}
            defaultVariationKey={featureFlag.defaultVariation}
            featureFlagType={featureFlag.type}
            segments={[]}
            variations={[variation]}
          />
        </form>
      </TestProviders>,
    );

    // Invalid input
    fireEvent.blur(screen.getByTestId('context-editor'), { target: { innerText: '' } });

    expect(screen.getByText('Must be valid JSON.')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Reset'));
    fireEvent.blur(screen.getByTestId('context-editor'), { target: { innerText: '{"key": "value"}' } });

    expect(screen.queryByText('Must be valid JSON.')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date (mm/dd/yyyy)'), { target: { value: '01/01/2026' } });
    fireEvent.blur(screen.getByLabelText('Date (mm/dd/yyyy)'));
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '10:30' } });

    await userEvent.click(screen.getByText('Test'));

    expect(
      await screen.findByText(
        `Serving variation '${featureFlag.defaultVariation}' with value 'true' due to no defined non-default rules.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Result calculated using simulated time')).toBeInTheDocument();
  });

  it('evaluates using an unsaved default variation change', async () => {
    const otherVariation = { ...variation, id: 'variation-2', key: 'disabled', value: false };

    render(
      <TestProviders>
        <form>
          <label htmlFor="defaultVariationId">Default variation</label>
          <select id="defaultVariationId" name="defaultVariationId" defaultValue={variation.id}>
            <option value={variation.id}>{variation.key}</option>
            <option value={otherVariation.id}>{otherVariation.key}</option>
          </select>
          <RunEvaluations
            applicationId={applicationId}
            defaultVariationKey={featureFlag.defaultVariation}
            featureFlagType={featureFlag.type}
            segments={[]}
            variations={[variation, otherVariation]}
          />
        </form>
      </TestProviders>,
    );

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Default variation' }), otherVariation.id);
    await userEvent.click(screen.getByText('Test'));

    expect(
      await screen.findByText(
        `Serving variation '${otherVariation.key}' with value 'false' due to no defined non-default rules.`,
      ),
    ).toBeInTheDocument();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DefaultRule } from '../DefaultRule';

describe('DefaultRule', () => {
  const variation = {
    applicationName: 'application',
    createdAt: '',
    deletedAt: null,
    environmentName: 'environment',
    flagId: 'flag-id',
    flagKey: 'flag-key',
    id: 'variation-id',
    key: 'variation-1',
    updatedAt: '',
    value: 'value',
  };

  it('should handle editing toggle', async () => {
    render(<DefaultRule defaultVariationId={variation.id} variations={[variation]} />);

    expect(screen.getByLabelText('Interact to expand Tile')).toBeInTheDocument();

    userEvent.click(screen.getByLabelText('Edit rule'));

    expect(await screen.findByLabelText('Interact to collapse Tile')).toBeInTheDocument();
  });

  it('should preserve selections when editing is cancelled', async () => {
    const variation2 = { ...variation, key: 'variation-2', id: 'variation-2' };
    const variations = [variation, variation2];

    render(<DefaultRule defaultVariationId={variation.id} variations={variations} />);

    expect(screen.getByLabelText('Serve')).toHaveValue(variation.id);

    await userEvent.click(screen.getByLabelText('Edit rule'));
    await userEvent.selectOptions(screen.getByLabelText('Serve'), variation2.id);

    expect(screen.getByLabelText('Serve')).toHaveValue(variation2.id);

    await userEvent.click(screen.getByText('Cancel edit'));

    expect(screen.getByLabelText('Serve')).toHaveValue(variation2.id);
  });
});

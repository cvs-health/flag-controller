// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Hero } from '../Hero';

describe('Hero', () => {
  it('renders', () => {
    const details = [
      {
        data: 'Data',
        label: 'Label',
        sublabel: 'Sublabel',
      },
      {
        data: 'Data 2',
        label: 'Label 2',
        sublabel: 'Sublabel 2',
      },
    ];
    const { getByText } = render(<Hero details={details}>Children</Hero>);

    expect(getByText('Data')).toBeInTheDocument();
    expect(getByText('Label')).toBeInTheDocument();
    expect(getByText('Sublabel')).toBeInTheDocument();
    expect(getByText('Data 2')).toBeInTheDocument();
    expect(getByText('Label 2')).toBeInTheDocument();
    expect(getByText('Sublabel 2')).toBeInTheDocument();
    expect(getByText('Children')).toBeInTheDocument();
  });
});

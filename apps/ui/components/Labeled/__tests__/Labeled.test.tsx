// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Labeled } from '../Labeled';

describe('Labeled', () => {
  it('renders', () => {
    const testLabel = 'Test Label';
    const children = 'Children';

    render(<Labeled label={testLabel}>{children}</Labeled>);

    expect(screen.getByText(children)).toBeInTheDocument();
  });
});

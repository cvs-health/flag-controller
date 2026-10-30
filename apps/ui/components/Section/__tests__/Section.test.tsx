// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from '../Section';

describe('Section', () => {
  it('renders', () => {
    const { getByText } = render(
      <Section heading="Heading" description="Description">
        Children
      </Section>,
    );

    expect(getByText('Heading')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Children')).toBeInTheDocument();
  });
});

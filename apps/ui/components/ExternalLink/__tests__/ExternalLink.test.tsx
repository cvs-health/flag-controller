// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ExternalLink } from '../ExternalLink';

describe('ExternalLink', () => {
  it('renders the link with the correct href', () => {
    const testHref = 'https://example.com';
    const testLabel = 'External Link';

    render(<ExternalLink href={testHref} label={testLabel} />);

    expect(screen.getByText(testLabel)).toHaveAttribute('href', testHref);
  });
});

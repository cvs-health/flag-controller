// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Flag } from '@carbon/pictograms-react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render', () => {
    const { getByText } = render(<EmptyState title="Title" body="Body" icon={Flag} />);

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Body')).toBeInTheDocument();
  });
});

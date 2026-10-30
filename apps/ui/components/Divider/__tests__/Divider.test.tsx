// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Divider from '../Divider';

describe('Divider', () => {
  it('should render', () => {
    const { container } = render(<Divider />);

    expect(container.childElementCount).toEqual(1);
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DiffType } from '../../../typings/audits';
import { DiffItem } from '../DiffItem';

describe('DiffItem', () => {
  it(`renders ${DiffType.Change} diff type`, () => {
    render(<DiffItem property="name" newValue="newValue" oldValue="oldValue" type={DiffType.Change} />);

    expect(screen.getByText('"oldValue"')).toBeInTheDocument();
    expect(screen.getByText('"newValue"')).toBeInTheDocument();
  });

  it(`renders ${DiffType.Add} diff type`, () => {
    render(<DiffItem property="name" newValue="newValue" oldValue="" type={DiffType.Add} />);

    expect(screen.getByText('name as')).toBeInTheDocument();
    expect(screen.getByText('"newValue"')).toBeInTheDocument();
  });

  it(`renders ${DiffType.Remove} diff type`, () => {
    render(<DiffItem property="name" newValue="" oldValue="oldValue" type={DiffType.Remove} />);

    expect(screen.getByText('name as')).toBeInTheDocument();
    expect(screen.getByText('"oldValue"')).toBeInTheDocument();
  });
});

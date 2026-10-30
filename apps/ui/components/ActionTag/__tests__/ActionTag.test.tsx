// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { ActionType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { actionLabels } from '../../../constants/common';
import { ActionTag } from '../ActionTag';

describe('ActionTag', () => {
  it('should render each action type', () => {
    Object.values(ActionType).forEach((action) => {
      render(<ActionTag action={action} />);
      expect(screen.getByText(actionLabels[action])).toBeInTheDocument();
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import { ChangeDetails } from '../ChangeDetails';

describe('ChangeDetails', () => {
  const baseAuditEntry = {
    id: 'entry-id',
    action: ActionType.Edit,
    actor: { email: 'test@example.com', id: '1' },
    application: {
      name: 'app',
      id: 'application-id',
    },
    createdAt: '2024-01-01',
    environment: { key: EnvironmentKey.Development, id: 'environment-id' },
    subject: {
      id: 'flag-id',
      key: 'flag',
      type: SubjectType.FeatureFlag,
    },
    oldData: { foo: 'bar' },
    newData: { foo: 'baz' },
  };

  it('handles opening changes', () => {
    render(<ChangeDetails auditEntry={baseAuditEntry} />);

    fireEvent.click(screen.getByText('View change details'));

    expect(screen.getByText('Change details')).toBeVisible();
  });

  it('disables button if no changes', () => {
    render(<ChangeDetails auditEntry={{ ...baseAuditEntry, oldData: null, newData: null }} />);

    expect(screen.getByText('View change details')).toBeDisabled();
  });
});

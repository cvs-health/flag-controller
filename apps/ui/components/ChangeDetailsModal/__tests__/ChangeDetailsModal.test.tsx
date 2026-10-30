// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { ChangeDetailsModal } from '../ChangeDetailsModal';

describe('ChangeDetailsModal', () => {
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

  it('handles close', () => {
    const onClose = vi.fn();

    render(<ChangeDetailsModal auditEntry={baseAuditEntry} open onClose={onClose} />);

    expect(screen.getByText('Change details')).toBeInTheDocument();

    const [, closeButton] = screen.getAllByText('Close');

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onClose).toHaveBeenCalled();
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LogFilters } from '../LogFilters';
import { TimeRange, ActionStatus, FormAction } from '../../../typings/common';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  state: { status: 'idle', errorMessage: '', form: {}, parsed: {}, filterCount: 0 },
  dispatch: vi.fn(),
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn(() => [mocks.state, mocks.dispatch]),
}));

describe('LogFilters', () => {
  it('should handle applying filters', () => {
    mocks.state = {
      errorMessage: '',
      filterCount: 3,
      form: {
        action: [ActionType.Archive],
        environment: [EnvironmentKey.Development],
        subject: [SubjectType.FeatureFlag],
        timeRange: TimeRange.None,
      },
      parsed: {
        environmentKey: [EnvironmentKey.Development],
        timeRange: TimeRange.None,
        actionType: [ActionType.Archive],
        subjectType: [SubjectType.FeatureFlag],
      },
      status: ActionStatus.Success,
    };
    const onApplyFilters = vi.fn();
    const initialFilters = {
      actionEndDate: '',
      actionStartDate: '',
      actionTypes: [],
      environmentKeys: [],
      subjectTypes: [],
      timeRange: TimeRange.None,
    };

    render(<LogFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    expect(onApplyFilters).toHaveBeenCalledWith({
      environmentKey: [EnvironmentKey.Development],
      timeRange: TimeRange.None,
      actionType: [ActionType.Archive],
      subjectType: [SubjectType.FeatureFlag],
    });
  });

  it('should handle error applying filters', () => {
    mocks.state = {
      errorMessage: 'Error',
      filterCount: 0,
      form: {
        action: [],
        environment: [],
        subject: [],
        timeRange: TimeRange.None,
      },
      parsed: {},
      status: ActionStatus.Error,
    };
    const onApplyFilters = vi.fn();
    const initialFilters = {
      actionEndDate: '',
      actionStartDate: '',
      actionTypes: [],
      environmentKeys: [],
      subjectTypes: [],
      timeRange: TimeRange.None,
    };

    render(<LogFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    expect(screen.getByText('Error applying filters')).toBeInTheDocument();
  });

  it('should handle toggling filters', async () => {
    mocks.state = {
      errorMessage: '',
      filterCount: 3,
      form: {
        action: [],
        environment: [],
        subject: [],
        timeRange: TimeRange.None,
      },
      parsed: {
        environmentKey: [],
        timeRange: TimeRange.None,
        actionType: [],
        subjectType: [],
      },
      status: ActionStatus.Idle,
    };
    const onApplyFilters = vi.fn();
    const initialFilters = {
      actionEndDate: '',
      actionStartDate: '',
      actionTypes: [],
      environmentKeys: [],
      subjectTypes: [],
      timeRange: TimeRange.None,
    };

    render(<LogFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    await userEvent.click(screen.getByLabelText('Filtering'));
    await userEvent.selectOptions(screen.getByLabelText('Time range'), TimeRange.Custom);
    await userEvent.click(screen.getByLabelText('Filtering'));

    expect(mocks.dispatch).toHaveBeenCalledWith(FormAction.RestoreForm);
  });

  it('should handle remvoving filters', async () => {
    mocks.state = {
      errorMessage: '',
      filterCount: 1,
      form: {
        action: [ActionType.Archive],
        environment: [],
        subject: [],
        timeRange: TimeRange.None,
      },
      parsed: {
        environmentKey: [],
        timeRange: TimeRange.None,
        actionType: [ActionType.Archive],
        subjectType: [],
      },
      status: ActionStatus.Idle,
    };
    const onApplyFilters = vi.fn();
    const initialFilters = {
      actionEndDate: '',
      actionStartDate: '',
      actionTypes: [ActionType.Archive],
      environmentKeys: [],
      subjectTypes: [],
      timeRange: TimeRange.None,
    };

    render(<LogFilters onApplyFilters={onApplyFilters} initialFilters={initialFilters} />);

    await userEvent.click(screen.getByLabelText('Clear filter'));

    expect(mocks.dispatch).toHaveBeenCalledWith({});
  });
});

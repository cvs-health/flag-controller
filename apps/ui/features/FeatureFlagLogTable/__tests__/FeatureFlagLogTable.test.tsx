// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import userEvent from '@testing-library/user-event';
import { ActionType, SubjectType, EnvironmentKey } from 'shared-types';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TestQueryClientProvider from '../../../test/TestQueryClientProvider';
import resolvePromiseWithData from '../../../test/resolvePromiseWithData';
import { FeatureFlagLogTable } from '../FeatureFlagLogTable';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/applications/featureflagmanagement/flags/subjectKey',
  useSearchParams: () => mocks.searchParams,
}));

describe('FeatureFlagLogTable', () => {
  const auditEntry = {
    action: ActionType.Create,
    actor: {
      email: 'email@mail.com',
      id: '1',
    },
    application: {
      name: 'application-name',
      id: 'application-id',
    },
    createdAt: '2024-01-01 12:00:00',
    environment: {
      id: 'environment-id',
      key: EnvironmentKey.Development,
    },
    id: 'id',
    subject: {
      key: 'subjectKey',
      type: SubjectType.FeatureFlag,
    },
  };

  it('should render entries', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [auditEntry], metadata: { rows: 1, page: 1, totalRecords: 1 } }),
    );

    render(
      <TestQueryClientProvider>
        <FeatureFlagLogTable featureFlagId="featureFlagId" />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByText(auditEntry.environment.key)).toBeInTheDocument();
  });

  it('should display a placeholder when no entries exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      resolvePromiseWithData({ data: [], metadata: { rows: 0, page: 0, totalRecords: 0 } }),
    );

    render(
      <TestQueryClientProvider>
        <FeatureFlagLogTable featureFlagId="featureFlagId" />
      </TestQueryClientProvider>,
    );

    expect(await screen.findByText('No logs exist yet')).toBeInTheDocument();
  });

  it('should allow the user to use pagination', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      resolvePromiseWithData({ data: [auditEntry], metadata: { totalRecords: 20 } }),
    );

    render(
      <TestQueryClientProvider>
        <FeatureFlagLogTable featureFlagId="featureFlagId" />
      </TestQueryClientProvider>,
    );

    await userEvent.click(screen.getByLabelText('Next page'));

    expect(mocks.replace).toHaveBeenCalledWith('/applications/featureflagmanagement/flags/subjectKey?page=2&rows=10', {
      scroll: false,
    });
  });
});

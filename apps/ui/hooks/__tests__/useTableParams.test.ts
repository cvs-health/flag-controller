// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useTableParams from '../useTableParams';
import { ColumnSortingDirection } from '../../typings/api';
import { EnvironmentKey } from 'shared-types';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/feature-flags',
  useSearchParams: () => mocks.searchParams,
}));

describe('useTableParams', () => {
  afterEach(() => {
    mocks.searchParams = new URLSearchParams();
  });

  it('should return default, empty values', async () => {
    const { result } = renderHook(() => useTableParams());

    expect(result.current.columnSorting).toEqual({ column: '', direction: ColumnSortingDirection.DESC });
    expect(result.current.filters).toEqual('');
    expect(result.current.pagination).toEqual({ page: 1, rows: 10 });
    expect(result.current.search).toEqual('');
  });

  it('should return default, already-set param values', async () => {
    mocks.searchParams.set('search', 'test-search');
    mocks.searchParams.set('filters', 'test-filters');
    mocks.searchParams.set('page', '2');
    mocks.searchParams.set('rows', '20');
    const { result } = renderHook(() => useTableParams());

    expect(result.current.columnSorting).toEqual({ column: '', direction: ColumnSortingDirection.DESC });
    expect(result.current.filters).toEqual('test-filters');
    expect(result.current.pagination).toEqual({ page: 2, rows: 20 });
    expect(result.current.search).toEqual('test-search');
  });

  it('should update URL when updateSearch is called', async () => {
    const { result } = renderHook(() => useTableParams());

    act(() => {
      result.current.updateSearch({ target: { value: 'test-search' } } as React.ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith('/feature-flags?search=test-search&page=1', { scroll: false });
    });
  });

  it('should update URL when updateSort is called', () => {
    const { result } = renderHook(() => useTableParams());

    act(() => {
      result.current.updateSort('name');
    });

    expect(mocks.replace).toHaveBeenCalledWith('/feature-flags?sort=name%3Aasc', { scroll: false });
  });

  it('should update URL when updatePagination is called', () => {
    const { result } = renderHook(() => useTableParams());

    act(() => {
      result.current.updatePagination({ page: 2, pageSize: 20 });
    });

    expect(mocks.replace).toHaveBeenCalledWith('/feature-flags?page=2&rows=20', { scroll: false });
  });

  it('should update URL when updateFilters is called', () => {
    const { result } = renderHook(() => useTableParams());

    act(() => {
      result.current.updateFilters({ environment: EnvironmentKey.Development, type: 'flag' });
    });

    expect(mocks.replace).toHaveBeenCalledWith(
      '/feature-flags?filters=environment%3Ddevelopment%26type%3Dflag&page=1',
      {
        scroll: false,
      },
    );
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import compareSegments from '../compareSegments';

describe('compareSegments', () => {
  const mockSegment = {
    applicationId: 'application-id',
    applicationName: 'test-app',
    createdAt: '2023-01-01T00:00:00Z',
    deletedAt: null,
    description: 'A test segment',
    id: 'segment-id',
    key: 'test-segment',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  it('should return empty array for identical segments', () => {
    const segment1 = { ...mockSegment };
    const segment2 = { ...mockSegment };

    const result = compareSegments(segment1, segment2);

    expect(result).toEqual([]);
  });

  it('should detect differences in description property', () => {
    const segment1 = { ...mockSegment, description: 'Old description' };
    const segment2 = { ...mockSegment, description: 'New description' };

    const result = compareSegments(segment1, segment2);

    expect(result).toEqual([
      {
        property: 'description',
        oldValue: 'Old description',
        newValue: 'New description',
      },
    ]);
  });

  it('should not detect differences for non-description changes', () => {
    const segment1 = { ...mockSegment };
    const segment2 = {
      applicationId: 'application-id-diff',
      applicationName: 'test-app-diff',
      createdAt: '2025-01-01T00:00:00Z',
      deletedAt: '2025-01-01T00:00:00Z',
      description: 'A test segment',
      id: 'segment-id-diff',
      key: 'test-segment-diff',
      updatedAt: '2025-01-01T00:00:00Z-diff',
    };

    const result = compareSegments(segment1, segment2);

    expect(result).toEqual([]);
  });
});

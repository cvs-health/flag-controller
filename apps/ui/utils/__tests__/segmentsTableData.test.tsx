// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@carbon/react';
import { describe, expect, it } from 'vitest';

import segmentsTableData from '../segmentsTableData';

describe('segmentsTableData', () => {
  it('should provide table data based on list of segments', () => {
    const segment = {
      applicationId: 'applicaton-id',
      applicationName: 'applicationName',
      createdAt: '2025-04-11T12:00:00Z',
      deletedAt: null,
      description: 'description',
      environmentKey: 'development',
      flagTargetCount: 0,
      id: 'segment-id',
      key: 'segmentKey',
      updatedAt: '2025-04-11T14:00:00Z',
    };

    const [result] = segmentsTableData([segment]);

    expect(result?.updatedAt).toEqual('04/11/2025 at 10:00 AM');
    expect(result?.id).toEqual(segment.id);
    expect(result?.key).toEqual(
      <Link href={`/applications/${segment.applicationName}/segments/${segment.key}`}>{segment.key}</Link>,
    );
  });
});

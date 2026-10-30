// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import userAssociatedApplication from '../userAssociatedApplication';

describe('userAssociatedApplication', () => {
  it('should return true when application id is in the list', () => {
    const applicationId = '1';
    const applications = [
      { name: 'app1', id: '1' },
      { name: 'test-app', id: '2' },
      { name: 'app2', id: '3' },
    ];

    expect(userAssociatedApplication(applicationId, applications)).toEqual(true);
  });

  it('should return false when application id is not in the list', () => {
    const applicationId = '4';
    const applications = [
      { name: 'app1', id: '1' },
      { name: 'app2', id: '2' },
      { name: 'app3', id: '3' },
    ];

    expect(userAssociatedApplication(applicationId, applications)).toEqual(false);
  });
});

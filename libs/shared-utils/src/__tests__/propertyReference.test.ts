// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import propertyReference from '../propertyReference.js';

describe('propertyReference', () => {
  it('should provide a property reference', () => {
    expect(propertyReference('applicationName', 'environmentKey', 'key')).toEqual('applicationName/environmentKey/key');
  });
});

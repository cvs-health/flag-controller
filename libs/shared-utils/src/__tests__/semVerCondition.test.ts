// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator } from 'shared-types';
import { describe, expect, it } from 'vitest';

import semVerCondition from '../semVerCondition.js';

describe('semVerCondition', () => {
  it('should provide a sem version condition', () => {
    const condition = {
      clause: Clause.SemVer,
      context: 'version',
      operator: Operator.GreaterThan,
      values: '1.0.0',
    };
    expect(semVerCondition(condition)).toEqual({
      sem_ver: [
        {
          var: 'version',
        },
        Operator.GreaterThan,
        condition.values,
      ],
    });
  });
});

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FractionalOp, FractionalRule, FractionalWeight, VariadicRule } from 'shared-types';

function fractionalTargeting(weights: FractionalWeight[], flagdVar?: string | null): FractionalRule {
  return {
    fractional: [
      ...(flagdVar
        ? [
            {
              cat: [
                {
                  var: '$flagd.flagKey',
                },
                {
                  var: flagdVar,
                },
              ],
            } as VariadicRule,
          ]
        : []),
      ...weights,
    ] as FractionalOp,
  };
}

export default fractionalTargeting;

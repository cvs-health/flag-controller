// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import flagdEvaluationReasonAsNoun from '../flagdEvaluationReasonAsNoun';

describe('flagdEvaluationReasonAsNoun', () => {
  it('should return correct verbiage for all evaluation reasons', () => {
    expect(flagdEvaluationReasonAsNoun('DEFAULT')).toEqual('a match against the default rule');
    expect(flagdEvaluationReasonAsNoun('TARGETING_MATCH')).toEqual('a match against a non-default rule');
    expect(flagdEvaluationReasonAsNoun('SPLIT')).toEqual(`a match against a rule's percentage roll-out`);
    expect(flagdEvaluationReasonAsNoun('DISABLED')).toEqual('the flag being disabled');
    expect(flagdEvaluationReasonAsNoun('ERROR')).toEqual('an error');
    expect(flagdEvaluationReasonAsNoun('STATIC')).toEqual('no defined non-default rules');
    expect(flagdEvaluationReasonAsNoun('UNKNOWN_REASON')).toEqual('an unknown reason');
  });
});

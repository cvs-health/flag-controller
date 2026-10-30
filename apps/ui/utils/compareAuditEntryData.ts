// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { SubjectType } from 'shared-types';

import compareFeatureFlagEnvironments from './compareFeatureFlagEnvironments';
import compareFeatureFlags from './compareFeatureFlags';
import compareRules from './compareRules';
import compareSegments from './compareSegments';
import compareVariations from './compareVariations';
import { type ChangeDataTypes, type DiffChanges, DiffType } from '../typings/audits';

type Data = ChangeDataTypes[keyof ChangeDataTypes];

function compareAuditEntryData(subjectType: SubjectType, oldData: Data, newData: Data): DiffChanges {
  const baseChanges = {
    [DiffType.Add]: [],
    [DiffType.Change]: [],
    [DiffType.Remove]: [],
  };

  if (oldData && newData) {
    if (subjectType === SubjectType.FeatureFlag) {
      return {
        ...baseChanges,
        [DiffType.Change]: compareFeatureFlags(oldData as ChangeDataTypes['flag'], newData as ChangeDataTypes['flag']),
      };
    }
    if (subjectType === SubjectType.FeatureFlagEnvironment) {
      return {
        ...baseChanges,
        [DiffType.Change]: compareFeatureFlagEnvironments(
          oldData as ChangeDataTypes['flagEnvironment'],
          newData as ChangeDataTypes['flagEnvironment'],
        ),
      };
    }
    if (subjectType === SubjectType.Rule) {
      return {
        ...baseChanges,
        [DiffType.Change]: compareRules(oldData as ChangeDataTypes['rule'], newData as ChangeDataTypes['rule']),
      };
    }
    if (subjectType === SubjectType.Variation) {
      return compareVariations(oldData as ChangeDataTypes['variation'], newData as ChangeDataTypes['variation']);
    }

    if (subjectType === SubjectType.Segment) {
      return {
        ...baseChanges,
        [DiffType.Change]: compareSegments(
          oldData as ChangeDataTypes['segment'],
          newData as ChangeDataTypes['segment'],
        ),
      };
    }
  }

  return baseChanges;
}

export default compareAuditEntryData;

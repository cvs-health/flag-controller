// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { RulesJoined, RuleCondition } from 'shared-types';

import type { WithId } from './common';

export enum SegmentRuleConditional {
  IfContext = 0,
  AndContext = 1,
}

export enum RuleConditional {
  If = 0,
  And = 1,
}

export type AsPending<T> = T & { created?: boolean };

export type PendingFeatureFlagRule = AsPending<
  Omit<RulesJoined, 'segmentId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'serveVariationKey'> &
    Partial<Pick<RulesJoined, 'serveVariationKey'>>
>;
export type PendingSegmentRule = AsPending<Omit<RulesJoined, 'flagId' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
export type RuleConditionWithId = WithId<RuleCondition>;

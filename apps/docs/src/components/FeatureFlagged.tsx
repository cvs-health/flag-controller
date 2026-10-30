// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren, ReactNode } from 'react';
import { useBooleanFlagValue } from '@openfeature/react-sdk';

import type { FeatureFlag } from '@site/types/featureFlags';

interface FeatureFlaggedProps extends PropsWithChildren {
  fallback?: ReactNode;
  flagKey: FeatureFlag;
}

function FeatureFlagged({ flagKey, children, fallback = null }: FeatureFlaggedProps) {
  const isEnabled = useBooleanFlagValue(flagKey, false);

  return isEnabled ? children : fallback;
}

export default FeatureFlagged;

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useMutation } from '@tanstack/react-query';
import type { MutationOptions } from '../../typings/api';
import patchFeatureFlag from '../requests/patchFeatureFlag';

export const patchFeatureFlagMutationKey = 'patchFeatureFlagMutationKey';

function usePatchFeatureFlagMutation(options: MutationOptions<typeof patchFeatureFlag> = {}) {
  return useMutation({
    ...options,
    mutationKey: [patchFeatureFlagMutationKey],
    mutationFn: patchFeatureFlag,
  });
}

export default usePatchFeatureFlagMutation;

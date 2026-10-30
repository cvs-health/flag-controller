// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useMutation } from '@tanstack/react-query';
import type { MutationOptions } from '../../typings/api';
import patchFeatureFlagEnvironment from '../requests/patchFeatureFlagEnvironment';

export const patchFeatureFlagEnvironmentMutationKey = 'patchFeatureFlagEnvironmentMutationKey';

function usePatchFeatureFlagEnvironmentMutation(options: MutationOptions<typeof patchFeatureFlagEnvironment> = {}) {
  return useMutation({
    ...options,
    mutationKey: [patchFeatureFlagEnvironmentMutationKey],
    mutationFn: patchFeatureFlagEnvironment,
  });
}

export default usePatchFeatureFlagEnvironmentMutation;

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import patchFeatureFlag from '../api/requests/patchFeatureFlag';
import type { ArchiveFeatureFlagFormData } from '../features/ArchiveFeatureFlagModal/ArchiveFeatureFlagModal';
import { ActionStatus, type ActionErrors } from '../typings/common';
import { actionErrorsFrom } from '../utils/actionErrorsFrom';

export type ArchiveFeatureFlagReturn<P> = P & {
  errors?: ActionErrors;
  status: ActionStatus;
};

async function archiveFeatureFlag<P>(prevState: P, formData: FormData) {
  const rawFormData = Object.fromEntries(formData) as unknown as ArchiveFeatureFlagFormData;
  const requestPayload = {
    featureFlagId: rawFormData.featureFlagId,
    body: {
      archived: true,
    },
  };

  try {
    await patchFeatureFlag(requestPayload);

    return {
      ...prevState,
      status: ActionStatus.Success,
    };
  } catch (error) {
    return {
      ...prevState,
      errors: actionErrorsFrom(error, { title: 'Failed to archive feature flag' }),
      status: ActionStatus.Error,
    };
  }
}

export default archiveFeatureFlag;

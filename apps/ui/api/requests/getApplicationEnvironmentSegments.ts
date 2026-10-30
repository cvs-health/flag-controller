// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import apiRequest from '../../utils/apiRequest';

export const getApplicationEnvironmentSegmentsUrl = (
  applicationName: string,
  environmentKey: string,
  definedConditions = false,
) => `application/${applicationName}/environment/${environmentKey}/segments?definedConditions=${definedConditions}`;

async function getApplicationEnvironmentSegments(
  applicationName: string,
  environmentKey: string,
  definedConditions = false,
) {
  return await apiRequest<string[]>(
    getApplicationEnvironmentSegmentsUrl(applicationName, environmentKey, definedConditions),
  );
}

export default getApplicationEnvironmentSegments;

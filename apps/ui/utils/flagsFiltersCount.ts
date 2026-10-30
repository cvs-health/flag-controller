// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FeatureFlagsFilters } from '../typings/flags';

function flagsFiltersCount(filters: FeatureFlagsFilters) {
  const archivedCount = filters.archived ? 1 : 0;
  const enabledInCount = filters.enabledIn.length > 0 ? 1 : 0;
  const creationCount = filters.createdAtStartDate || filters.createdAtEndDate ? 1 : 0;
  const lastModifiedCount = filters.updatedAtStartDate || filters.updatedAtEndDate ? 1 : 0;
  const typeCount = filters.featureFlagTypes.length > 0 ? 1 : 0;

  return archivedCount + enabledInCount + creationCount + lastModifiedCount + typeCount;
}

export default flagsFiltersCount;

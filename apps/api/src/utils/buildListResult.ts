// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import buildListMetadata, { type ListMetadataOptions } from 'utils/buildListMetadata.js';
import type { ServicePaginationParams } from '../types/services.js';

function buildListResult<T>(
  data: T[],
  totalRecords: number,
  pagination: ServicePaginationParams,
  options?: ListMetadataOptions,
) {
  return {
    data,
    metadata: buildListMetadata(data, totalRecords, pagination, options),
  };
}

export default buildListResult;

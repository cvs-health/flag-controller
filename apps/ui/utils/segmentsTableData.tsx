// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { SegmentsJoinedWithTargetCount } from 'shared-types';

import { Link } from '../components/Carbon';
import { FlagsTargetedEnvironmentCount } from '../components/FlagsTargetedEnvironmentCount/FlagsTargetedEnvironmentCount';
import formatDateTime from './formatDateTime';

function segmentsTableData(segments: SegmentsJoinedWithTargetCount[] = []) {
  return segments.map((segment) => ({
    applicationName: <Link href={`/applications/${segment.applicationName}`}>{segment.applicationName}</Link>,
    flagTargetCount: <FlagsTargetedEnvironmentCount count={segment.flagTargetCount} />,
    id: segment.id,
    key: <Link href={`/applications/${segment.applicationName}/segments/${segment.key}`}>{segment.key}</Link>,
    updatedAt: formatDateTime(segment.updatedAt),
    modifiedDate: segment.updatedAt,
  }));
}

export default segmentsTableData;

// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { ArchiveFeatureFlagModal } from '../ArchiveFeatureFlagModal/ArchiveFeatureFlagModal';

interface FeatureFlagsTableActionsProps {
  applicationId: string;
  featureFlagId: string;
  featureFlagKey: string;
  onArchived?: () => void;
}

export function FeatureFlagsTableActions({
  applicationId,
  featureFlagId,
  featureFlagKey,
  onArchived,
}: FeatureFlagsTableActionsProps) {
  return (
    <ArchiveFeatureFlagModal
      applicationId={applicationId}
      featureFlagId={featureFlagId}
      featureFlagKey={featureFlagKey}
      onSuccess={onArchived}
    >
      {(onOpen) => (
        <OverflowMenu iconDescription="Actions" size="md" autoAlign>
          <OverflowMenuItem itemText="Archive flag" onClick={onOpen} />
        </OverflowMenu>
      )}
    </ArchiveFeatureFlagModal>
  );
}

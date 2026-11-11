// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useQueryClient } from '@tanstack/react-query';

import { ArchiveFeatureFlagModal } from '../ArchiveFeatureFlagModal/ArchiveFeatureFlagModal';
import { getFeatureFlagsQueryKey } from '../../api/queries/useGetFeatureFlagsQuery';

interface FeatureFlagsTableActionsProps {
  applicationId: string;
  featureFlagId: string;
  featureFlagKey: string;
}

export function FeatureFlagsTableActions({
  applicationId,
  featureFlagId,
  featureFlagKey,
}: FeatureFlagsTableActionsProps) {
  const queryClient = useQueryClient();

  function handleArchiveSuccess() {
    void queryClient.invalidateQueries({ queryKey: [getFeatureFlagsQueryKey] });
  }

  return (
    <ArchiveFeatureFlagModal
      applicationId={applicationId}
      featureFlagId={featureFlagId}
      featureFlagKey={featureFlagKey}
      id={`archiveFeatureFlag-${featureFlagId}`}
      onSuccess={handleArchiveSuccess}
    >
      {(onOpen) => (
        <OverflowMenu iconDescription="Actions" size="md" autoAlign>
          <OverflowMenuItem itemText="Archive flag" onClick={onOpen} />
        </OverflowMenu>
      )}
    </ArchiveFeatureFlagModal>
  );
}

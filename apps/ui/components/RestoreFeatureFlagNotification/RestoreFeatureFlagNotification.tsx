// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { ActionableNotification } from '@carbon/react';

import { RestoreFeatureFlagModal } from '../../features/RestoreFeatureFlagModal/RestoreFeatureFlagModal';

interface RestoreFeatureFlagNotificationProps {
  applicationName: string;
  className?: string;
  featureFlagKey: string;
  featureFlagId: string;
  onSuccess: () => void;
}

export function RestoreFeatureFlagNotification({
  applicationName,
  className = '',
  featureFlagKey,
  featureFlagId,
  onSuccess,
}: RestoreFeatureFlagNotificationProps) {
  return (
    <RestoreFeatureFlagModal
      applicationName={applicationName}
      featureFlagId={featureFlagId}
      featureFlagKey={featureFlagKey}
      onSuccess={onSuccess}
    >
      {(onOpen) => (
        <ActionableNotification
          actionButtonLabel="Restore"
          className={className}
          hideCloseButton
          inline
          kind="warning"
          onActionButtonClick={onOpen}
          subtitle="Editing the flag is disabled until the flag is restored."
          title="Flag is currently archived"
        />
      )}
    </RestoreFeatureFlagModal>
  );
}

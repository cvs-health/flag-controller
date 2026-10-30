// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Button } from '@carbon/react';
import { useRouter } from 'next/navigation';

import { ArchiveFeatureFlagModal } from '../ArchiveFeatureFlagModal/ArchiveFeatureFlagModal';

interface ArchiveFeatureFlagButtonProps {
  applicationId: string;
  featureFlagKey: string;
  featureFlagId: string;
}

export function ArchiveFeatureFlagButton({
  applicationId,
  featureFlagKey,
  featureFlagId,
}: ArchiveFeatureFlagButtonProps) {
  const router = useRouter();

  return (
    <ArchiveFeatureFlagModal
      applicationId={applicationId}
      featureFlagId={featureFlagId}
      featureFlagKey={featureFlagKey}
      onSuccess={router.refresh}
    >
      {(onOpen) => (
        <Button kind="tertiary" onClick={onOpen}>
          Archive flag
        </Button>
      )}
    </ArchiveFeatureFlagModal>
  );
}

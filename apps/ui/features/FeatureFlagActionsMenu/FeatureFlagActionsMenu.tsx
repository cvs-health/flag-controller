// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Archive } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

import { ArchiveFeatureFlagModal } from '../ArchiveFeatureFlagModal/ArchiveFeatureFlagModal';
import { MenuButton, MenuItem } from '../../components/Carbon';

interface FeatureFlagActionsMenuProps {
  applicationId: string;
  featureFlagId: string;
  featureFlagKey: string;
}

export function FeatureFlagActionsMenu({ applicationId, featureFlagId, featureFlagKey }: FeatureFlagActionsMenuProps) {
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  function renderMenuButton(onOpen: () => void) {
    return (
      <MenuButton label="Actions" menuAlignment="bottom-end" kind="tertiary">
        <MenuItem label="Archive flag" renderIcon={Archive} onClick={onOpen} />
      </MenuButton>
    );
  }

  return (
    <ArchiveFeatureFlagModal
      applicationId={applicationId}
      featureFlagId={featureFlagId}
      featureFlagKey={featureFlagKey}
      onSuccess={handleSuccess}
    >
      {renderMenuButton}
    </ArchiveFeatureFlagModal>
  );
}

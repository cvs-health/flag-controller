// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Add } from '@carbon/icons-react';

import { Button, Stack } from '../../components/Carbon';
import { CreateFeatureFlagModal } from '../../features/CreateFeatureFlagModal/CreateFeatureFlagModal';
import { FeatureFlagsTable } from '../../features/FeatureFlagsTable/FeatureFlagsTable';
import styles from './page.module.scss';

function Flags() {
  const router = useRouter();
  const [showCreateFeatureFlagModal, setShowCreateFeatureFlagModal] = useState(false);

  function handleCreateFeatureFlagSuccess(applicationName: string, featureFlagKey: string) {
    router.push(`/applications/${applicationName}/flags/${featureFlagKey}`);
  }

  function toggleCreateFeatureFlagModal() {
    setShowCreateFeatureFlagModal(!showCreateFeatureFlagModal);
  }

  return (
    <Stack className={styles.root} gap={8}>
      <h1>Flags</h1>
      {showCreateFeatureFlagModal && (
        <CreateFeatureFlagModal
          onClose={toggleCreateFeatureFlagModal}
          onSuccess={handleCreateFeatureFlagSuccess}
          open
        />
      )}
      <FeatureFlagsTable>
        <Button type="button" renderIcon={Add} onClick={toggleCreateFeatureFlagModal}>
          Create flag
        </Button>
      </FeatureFlagsTable>
    </Stack>
  );
}

export default Flags;

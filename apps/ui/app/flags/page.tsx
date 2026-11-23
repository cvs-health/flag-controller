// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scope } from 'shared-types';

import { Add } from '@carbon/icons-react';

import { Button, Stack } from '../../components/Carbon';
import { CreateFeatureFlagModal } from '../../features/CreateFeatureFlagModal/CreateFeatureFlagModal';
import { FeatureFlagsTable } from '../../features/FeatureFlagsTable/FeatureFlagsTable';
import { Switcher } from '../../components/Switcher/Switcher';
import { flagsScopeLabels } from '../../constants/common';
import styles from './page.module.scss';

const flagsScopeDescriptions = {
  [Scope.Me]: "Flags from your teams' applications",
  [Scope.All]: "Flags across the organization's applications",
};

function Flags() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = searchParams.get('scope') === Scope.All ? Scope.All : Scope.Me;
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
      <Stack gap={3}>
        <Switcher className={styles.switcher} parameter="scope" selected={scope} switches={flagsScopeLabels} />
        <p>{flagsScopeDescriptions[scope]}</p>
      </Stack>
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

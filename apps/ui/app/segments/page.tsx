// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { Add } from '@carbon/icons-react';
import { Scope } from 'shared-types';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import styles from './page.module.scss';
import { Button, Stack } from '../../components/Carbon';
import { CreateSegmentModal } from '../../features/CreateSegmentModal/CreateSegmentModal';
import { SegmentsTable } from '../../features/SegmentsTable/SegmentsTable';
import { Switcher } from '../../components/Switcher/Switcher';

const segmentsSwitches = {
  [Scope.Me]: 'My segments',
  [Scope.All]: 'All segments',
} as const;
const switchSublabel = {
  [Scope.Me]: "Segments from your teams' applications",
  [Scope.All]: "Segments across the organization's applications",
};

function Segments() {
  const searchParams = useSearchParams();
  const scope = searchParams.get('scope') === Scope.All ? Scope.All : Scope.Me;
  const router = useRouter();
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);

  function toggleCreateSegmentModal() {
    setShowCreateSegmentModal(!showCreateSegmentModal);
  }

  function handleCreateSegmentSuccess(applicationName: string, segmentKey: string) {
    router.push(`/applications/${applicationName}/segments/${segmentKey}`);
  }

  return (
    <Stack className={styles.root} gap={6}>
      <h1>Segments</h1>
      <Switcher className={styles.switcher} parameter="scope" selected={scope} switches={segmentsSwitches} />
      <p className={styles.sublabel}>{switchSublabel[scope]}</p>
      <div>
        {showCreateSegmentModal && (
          <CreateSegmentModal onClose={toggleCreateSegmentModal} open onSuccess={handleCreateSegmentSuccess} />
        )}
        <SegmentsTable>
          <Button type="button" renderIcon={Add} onClick={toggleCreateSegmentModal}>
            Create segment
          </Button>
        </SegmentsTable>
      </div>
    </Stack>
  );
}

export default Segments;

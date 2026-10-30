// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { useState } from 'react';

import { Add } from '@carbon/icons-react';

import { Button, Stack } from '../../components/Carbon';
import { CreateSegmentModal } from '../../features/CreateSegmentModal/CreateSegmentModal';
import { SegmentsTable } from '../../features/SegmentsTable/SegmentsTable';
import styles from './page.module.scss';
import { useRouter } from 'next/navigation';

function Segments() {
  const router = useRouter();
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);

  function toggleCreateSegmentModal() {
    setShowCreateSegmentModal(!showCreateSegmentModal);
  }

  function handleCreateSegmentSuccess(applicationName: string, segmentKey: string) {
    router.push(`/applications/${applicationName}/segments/${segmentKey}`);
  }

  return (
    <Stack className={styles.root} gap={8}>
      <h1>Segments</h1>
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

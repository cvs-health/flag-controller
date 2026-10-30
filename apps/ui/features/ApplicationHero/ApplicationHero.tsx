// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useState } from 'react';

import { CreateFeatureFlagModal } from '../CreateFeatureFlagModal/CreateFeatureFlagModal';
import { CreateSegmentModal } from '../CreateSegmentModal/CreateSegmentModal';
import { Hero } from '../../components/Hero/Hero';
import { ViewLink } from '../../components/ViewLink/ViewLink';
import { useRouter } from 'next/navigation';
import { MenuButton, MenuItem } from '../../components/Carbon';

interface ApplicationHeroProps {
  applicationName?: string;
  teamName?: string;
  actionsEnabled?: boolean;
  applicationId: string;
}

function ApplicationHero({
  applicationName = '',
  teamName = '',
  actionsEnabled = false,
  applicationId,
}: ApplicationHeroProps) {
  const [showCreateFeatureFlagModal, setShowCreateFeatureFlagModal] = useState(false);
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
  const router = useRouter();

  function toggleCreateFeatureFlagModal() {
    setShowCreateFeatureFlagModal(!showCreateFeatureFlagModal);
  }

  function toggleCreateSegmentModal() {
    setShowCreateSegmentModal(!showCreateSegmentModal);
  }

  function handleCreateFeatureFlagSuccess(applicationName: string, featureFlagKey: string) {
    router.push(`/applications/${applicationName}/flags/${featureFlagKey}`);
  }

  function handleCreateSegmentSuccess(applicationName: string, segmentKey: string) {
    router.push(`/applications/${applicationName}/segments/${segmentKey}`);
  }

  return (
    <>
      <Hero
        details={[
          {
            label: 'Application',
            data: applicationName,
          },
          {
            label: 'Team',
            data: teamName,
            sublabel: <ViewLink type="team" value={teamName} />,
          },
        ]}
      >
        {actionsEnabled && (
          <MenuButton label="Create" menuAlignment="bottom">
            <MenuItem label="Flag" onClick={toggleCreateFeatureFlagModal} />
            <MenuItem label="Segment" onClick={toggleCreateSegmentModal} />
          </MenuButton>
        )}
      </Hero>
      {showCreateFeatureFlagModal && (
        <CreateFeatureFlagModal
          onClose={toggleCreateFeatureFlagModal}
          open
          onSuccess={handleCreateFeatureFlagSuccess}
          defaultApplicationId={applicationId}
        />
      )}

      {showCreateSegmentModal && (
        <CreateSegmentModal
          onClose={toggleCreateSegmentModal}
          open
          defaultApplicationId={applicationId}
          onSuccess={handleCreateSegmentSuccess}
        />
      )}
    </>
  );
}

export default ApplicationHero;

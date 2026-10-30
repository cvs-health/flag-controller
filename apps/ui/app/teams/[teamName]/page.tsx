// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Layer, TabList, TabPanel, TabPanels, Tabs } from '../../../components/Carbon';
import { TabLink } from '../../../components/TabLink/TabLink';
import { MembersTable } from '../../../features/MembersTable/MembersTable';
import { TeamApplicationsTable } from '../../../features/TeamApplicationsTable/TeamApplicationsTable';
import TeamLog from '../../../features/TeamLogTable/TeamLogTable';
import { TeamHero } from '../../../features/TeamHero/TeamHero';
import styles from './page.module.scss';
import tryCatchApiRequest from '../../../utils/tryCatchApiRequest';
import { throwPageError } from '../../../utils/throwPageError';
import getTeam from '../../../api/requests/getTeam';

interface TeamProps {
  searchParams: Promise<Record<'tab', string | undefined>>;
  params: Promise<Record<'teamName', string>>;
}

async function Team({ searchParams, params }: TeamProps) {
  const tabsIndeces = {
    applications: 0,
    log: 1,
    members: 2,
  };
  const parameters = await params;
  const searchParameters = await searchParams;
  const [team, teamError] = await tryCatchApiRequest(getTeam(parameters.teamName));

  if (!team) {
    throwPageError(teamError);
  }

  const selectedIndex = tabsIndeces[searchParameters.tab as keyof typeof tabsIndeces] ?? tabsIndeces.applications;
  const teamId = team.id;

  return (
    <>
      <TeamHero teamName={parameters.teamName} />
      <Tabs selectedIndex={selectedIndex}>
        <TabList aria-label="List of tabs" contained role="tablist">
          <TabLink label="Applications" id="applications" />
          <TabLink label="Log" id="log" />
          <TabLink label="Members" id="members" />
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <Layer>
              <TeamApplicationsTable teamId={teamId} />
            </Layer>
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <Layer>{selectedIndex === tabsIndeces.log ? <TeamLog teamId={teamId} /> : null}</Layer>
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <Layer>{selectedIndex === tabsIndeces.members ? <MembersTable teamId={teamId} /> : null}</Layer>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Team;

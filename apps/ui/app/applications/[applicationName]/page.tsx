// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Activity } from 'react';

import ApplicationHero from '../../../features/ApplicationHero/ApplicationHero';
import getApplication from '../../../api/requests/getApplication';
import getSession from '../../../api/requests/getSession';
import getUserApplications from '../../../api/requests/getUserApplications';
import styles from './page.module.scss';
import tryCatchApiRequest from '../../../utils/tryCatchApiRequest';
import { throwPageError } from '../../../utils/throwPageError';
import userAssociatedApplication from '../../../utils/userAssociatedApplication';
import { ApplicationFeatureFlagsTable } from '../../../features/ApplicationFeatureFlagsTable/ApplicationFeatureFlagsTable';
import { ApplicationLogTable } from '../../../features/ApplicationLogTable/ApplicationLogTable';
import { ApplicationSegmentsTable } from '../../../features/ApplicationSegmentsTable/ApplicationSegmentsTable';
import { InlineNotification, Layer, TabList, TabPanel, TabPanels, Tabs } from '../../../components/Carbon';
import { TabLink } from '../../../components/TabLink/TabLink';

enum Tab {
  Flags = 'flags',
  Segments = 'segments',
  Log = 'log',
}

interface ApplicationProps {
  searchParams: Promise<Record<'tab', Tab | undefined>>;
  params: Promise<Record<'applicationName', string>>;
}

async function Application({ searchParams, params }: ApplicationProps) {
  const [parameters, session] = await Promise.all([params, getSession()]);
  const [searchParameters, [application, applicationError], [userApplications]] = await Promise.all([
    searchParams,
    tryCatchApiRequest(getApplication(parameters.applicationName)),
    tryCatchApiRequest(getUserApplications(session?.user.id || '')),
  ]);

  if (!application) {
    throwPageError(applicationError);
  }

  const userCanActOnApplication = userAssociatedApplication(application?.id, userApplications?.data);
  const tabsIndeces = {
    flags: 0,
    segments: 1,
    log: 2,
  };
  const selectedIndex = tabsIndeces[searchParameters.tab as keyof typeof tabsIndeces] ?? tabsIndeces.flags;
  const applicationId = application.id;

  return (
    <>
      {!userCanActOnApplication && (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="warning"
          subtitle="This application is not associated to you."
          title="You do not have permission to act on this application"
        />
      )}
      <ApplicationHero
        applicationId={applicationId}
        applicationName={parameters.applicationName}
        actionsEnabled={userCanActOnApplication}
        teamName={application.teamName}
      />
      <Tabs selectedIndex={selectedIndex}>
        <TabList aria-label="List of tabs" contained role="tablist">
          <TabLink label="Flags" id={Tab.Flags} />
          <TabLink label="Segments" id={Tab.Segments} />
          <TabLink label="Log" id={Tab.Log} />
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <Activity mode={selectedIndex === tabsIndeces.flags ? 'visible' : 'hidden'}>
              <Layer>
                <ApplicationFeatureFlagsTable applicationId={applicationId} />
              </Layer>
            </Activity>
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <Activity mode={selectedIndex === tabsIndeces.segments ? 'visible' : 'hidden'}>
              <Layer>
                <ApplicationSegmentsTable applicationId={applicationId} />
              </Layer>
            </Activity>
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <Activity mode={selectedIndex === tabsIndeces.log ? 'visible' : 'hidden'}>
              <Layer>
                <ApplicationLogTable applicationId={applicationId} />
              </Layer>
            </Activity>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Application;

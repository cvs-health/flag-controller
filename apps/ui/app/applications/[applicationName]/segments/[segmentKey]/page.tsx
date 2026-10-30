// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey } from 'shared-types';

import getApplication from '../../../../../api/requests/getApplication';
import getApplicationEnvironments from '../../../../../api/requests/getApplicationEnvironments';
import getApplicationSegment from '../../../../../api/requests/getApplicationSegment';
import getSegmentRules from '../../../../../api/requests/getSegmentRules';
import getSession from '../../../../../api/requests/getSession';
import getUserApplications from '../../../../../api/requests/getUserApplications';
import styles from './page.module.scss';
import tryCatchApiRequest from '../../../../../utils/tryCatchApiRequest';
import { throwPageError } from '../../../../../utils/throwPageError';
import userAssociatedApplication from '../../../../../utils/userAssociatedApplication';
import { Hero } from '../../../../../components/Hero/Hero';
import { InlineNotification, Layer, TabList, TabPanel, TabPanels, Tabs } from '../../../../../components/Carbon';
import { ReadOnlySegmentRules } from '../../../../../components/ReadOnlySegmentRules/ReadOnlySegmentRules';
import { SegmentDescription } from '../../../../../features/SegmentDescription/SegmentDescription';
import { SegmentLogTable } from '../../../../../features/SegmentLogTable/SegmentLogTable';
import { SegmentRules } from '../../../../../features/SegmentRules/SegmentRules';
import { TabLink } from '../../../../../components/TabLink/TabLink';
import { ViewLink } from '../../../../../components/ViewLink/ViewLink';

interface Params {
  applicationName: string;
  segmentKey: string;
}

interface SearchParams {
  rulesEnvironment?: EnvironmentKey;
  tab?: 'rules' | 'variations' | 'log';
}

interface SegmentProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

async function Segment({ searchParams, params }: SegmentProps) {
  const [parameters, session] = await Promise.all([params, getSession()]);
  const [searchParameters, [application], [userApplications], [applicationSegment, applicationSegmentError]] =
    await Promise.all([
      searchParams,
      tryCatchApiRequest(getApplication(parameters.applicationName)),
      tryCatchApiRequest(getUserApplications(session?.user.id || '')),
      tryCatchApiRequest(getApplicationSegment(parameters.applicationName, parameters.segmentKey)),
    ]);

  if (!applicationSegment) {
    throwPageError(applicationSegmentError);
  }

  const environmentKey = searchParameters.rulesEnvironment || EnvironmentKey.Development;
  const applicationId = application?.id || '';
  const [applicationEnvironments] = await tryCatchApiRequest(getApplicationEnvironments(applicationId));
  const userCanActOnSegment = userAssociatedApplication(application?.id, userApplications?.data);
  const tabsIndeces = {
    rules: 0,
    log: 1,
  };
  const selectedIndex = tabsIndeces[searchParameters.tab as keyof typeof tabsIndeces] ?? tabsIndeces.rules;
  const teamName = application?.teamName || '';
  const segmentId = applicationSegment.id;
  const currentEnvironment = applicationEnvironments?.find((env) => env.key === environmentKey);
  const environmentId = currentEnvironment?.id || '';
  const [segmentRules] = await tryCatchApiRequest(getSegmentRules(environmentId, segmentId));
  const existingRules = segmentRules || [];

  return (
    <>
      {!userCanActOnSegment && (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="warning"
          subtitle="The application which owns this segment is not associated to you."
          title="You do not have permission to edit this segment"
        />
      )}
      <Hero
        details={[
          {
            label: 'Segment',
            data: parameters.segmentKey,
          },
          {
            label: 'Application',
            data: parameters.applicationName,
            sublabel: <ViewLink type="application" value={parameters.applicationName} />,
          },
          {
            label: 'Team',
            data: teamName,
            sublabel: <ViewLink type="team" value={teamName} />,
          },
        ]}
      />
      <SegmentDescription
        description={applicationSegment.description || ''}
        segmentId={segmentId}
        readOnly={!userCanActOnSegment}
      />
      <Tabs selectedIndex={selectedIndex}>
        <TabList aria-label="List of tabs" contained role="tablist">
          <TabLink label="Rules" id="rules" />
          <TabLink label="Log" id="log" />
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <Layer>
              {userCanActOnSegment ? (
                <SegmentRules
                  applicationId={applicationId}
                  environmentId={environmentId}
                  environments={applicationEnvironments}
                  existingRules={existingRules}
                  segmentId={segmentId}
                />
              ) : (
                <ReadOnlySegmentRules
                  existingRules={existingRules}
                  environmentId={environmentId}
                  environments={applicationEnvironments}
                />
              )}
            </Layer>
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <Layer>{selectedIndex === tabsIndeces.log ? <SegmentLogTable segmentId={segmentId} /> : null}</Layer>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Segment;

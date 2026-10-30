// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { EnvironmentKey } from 'shared-types';

import getApplication from '../../../../../api/requests/getApplication';
import getApplicationSegments from '../../../../../api/requests/getApplicationSegments';
import getFeatureFlag from '../../../../../api/requests/getFeatureFlag';
import getFeatureFlagEnvironments from '../../../../../api/requests/getFeatureFlagEnvironments';
import getFeatureFlagRules from '../../../../../api/requests/getFeatureFlagRules';
import getFeatureFlagVariations from '../../../../../api/requests/getFeatureFlagVariations';
import getSegmentRules from '../../../../../api/requests/getSegmentRules';
import getSession from '../../../../../api/requests/getSession';
import getUserApplications from '../../../../../api/requests/getUserApplications';
import revalidatePage from '../../../../../utils/revalidatePage';
import styles from './page.module.scss';
import tryCatchApiRequest from '../../../../../utils/tryCatchApiRequest';
import { throwPageError } from '../../../../../utils/throwPageError';
import type { SegmentWithRules } from '../../../../../typings/segments';
import userAssociatedApplication from '../../../../../utils/userAssociatedApplication';
import { FeatureFlagDetails } from '../../../../../features/FeatureFlagDetails/FeatureFlagDetails';
import { FeatureFlagLogTable } from '../../../../../features/FeatureFlagLogTable/FeatureFlagLogTable';
import { FeatureFlagRulesForm } from '../../../../../features/FeatureFlagRulesForm/FeatureFlagRulesForm';
import { FeatureFlagVariationsForm } from '../../../../../features/FeatureFlagVariationsForm/FeatureFlagVariationsForm';
import { InlineNotification, Layer, TabList, TabPanel, TabPanels, Tabs } from '../../../../../components/Carbon';
import { ReadOnlyFeatureFlagDetails } from '../../../../../features/ReadOnlyFeatureFlagDetails/ReadOnlyFeatureFlagDetails';
import { ReadOnlyFeatureFlagRules } from '../../../../../features/ReadOnlyFeatureFlagRules/ReadOnlyFeatureFlagRules';
import { ReadOnlyFeatureFlagVariations } from '../../../../../features/ReadOnlyFeatureFlagVariations/ReadOnlyFeatureFlagVariations';
import { RestoreFeatureFlagNotification } from '../../../../../components/RestoreFeatureFlagNotification/RestoreFeatureFlagNotification';
import { TabLink } from '../../../../../components/TabLink/TabLink';

enum Tab {
  Evaluations = 'evaluations',
  Log = 'log',
  Rules = 'rules',
  TestRun = 'testRun',
  Variations = 'variations',
}

interface Params {
  applicationName: string;
  featureFlagKey: string;
}

interface SearchParams {
  rulesEnvironment?: EnvironmentKey;
  tab?: 'rules' | 'variations' | 'evaluations' | 'log';
}

interface FlagProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

async function Flag({ searchParams, params }: FlagProps) {
  const [parameters, session] = await Promise.all([params, getSession()]);
  const [searchParameters, [userApplications]] = await Promise.all([
    searchParams,
    tryCatchApiRequest(getUserApplications(session?.user.id || '')),
  ]);
  const environmentKey = searchParameters.rulesEnvironment || EnvironmentKey.Development;
  const [featureFlag, featureFlagError] = await tryCatchApiRequest(
    getFeatureFlag(parameters.applicationName, parameters.featureFlagKey),
  );

  if (!featureFlag) {
    throwPageError(featureFlagError);
  }

  const featureFlagId = featureFlag.id;
  const applicationId = featureFlag.applicationId;

  const [[flagEnvironments], [application]] = await Promise.all([
    tryCatchApiRequest(getFeatureFlagEnvironments(featureFlagId)),
    tryCatchApiRequest(getApplication(parameters.applicationName)),
  ]);
  const userCanActOnFeatureFlag = userAssociatedApplication(application?.id, userApplications?.data);
  const currentEnvironment = flagEnvironments?.find((env) => env.environmentKey === environmentKey);
  const environmentId = currentEnvironment?.environmentId || '';
  const [[featureFlagRules], [featureFlagVariations], [applicationSegments]] = await Promise.all([
    tryCatchApiRequest(getFeatureFlagRules(environmentId, featureFlagId)),
    tryCatchApiRequest(getFeatureFlagVariations(featureFlagId)),
    tryCatchApiRequest(getApplicationSegments(applicationId, { rows: -1, page: 1 })),
  ]);
  const segmentIds = applicationSegments?.data.map(({ id }) => id) || [];
  const segmentRules = await Promise.all(
    segmentIds.map((segmentId) => tryCatchApiRequest(getSegmentRules(environmentId, segmentId))),
  );
  const segments: SegmentWithRules[] =
    applicationSegments?.data.map((segment, index) => ({
      ...segment,
      rules: segmentRules[index]?.[0] || [],
    })) || [];
  const existingRules = featureFlagRules || [];
  const readOnlyFeatureFlagRules = featureFlagRules || [];
  const archived = featureFlag.archived;
  const tabs = [
    {
      content: (!searchParameters.tab || searchParameters.tab === Tab.Rules) && (
        <>
          {!userCanActOnFeatureFlag || archived ? (
            <ReadOnlyFeatureFlagRules
              applicationId={applicationId}
              defaultVariationKey={currentEnvironment?.defaultServeKey || ''}
              defaultVariationId={currentEnvironment?.defaultServeId || ''}
              environmentKey={environmentKey}
              featureFlagRules={readOnlyFeatureFlagRules}
              featureFlagType={featureFlag.type}
              segments={segments}
              variations={featureFlagVariations || []}
            />
          ) : null}
          {userCanActOnFeatureFlag && !archived ? (
            <FeatureFlagRulesForm
              applicationId={applicationId}
              defaultVariationId={currentEnvironment?.defaultServeId || ''}
              environments={flagEnvironments}
              environmentId={environmentId}
              existingRules={existingRules}
              featureFlagId={featureFlagId}
              featureFlagType={featureFlag.type}
              segments={segments}
              variations={featureFlagVariations || []}
            />
          ) : null}
        </>
      ),
      id: Tab.Rules,
      label: 'Rules',
      visible: true,
    },
    {
      content:
        !userCanActOnFeatureFlag || archived ? (
          <ReadOnlyFeatureFlagVariations featureFlagType={featureFlag.type} variations={featureFlagVariations || []} />
        ) : (
          <FeatureFlagVariationsForm
            applicationName={parameters.applicationName}
            existingVariations={featureFlagVariations || []}
            featureFlagArchived={archived}
            featureFlagKey={parameters.featureFlagKey}
            featureFlagType={featureFlag.type}
            featureFlagId={featureFlagId}
          />
        ),
      id: Tab.Variations,
      label: 'Variations',
      visible: true,
    },
    {
      content: <FeatureFlagLogTable featureFlagId={featureFlagId} />,
      id: Tab.Log,
      label: 'Log',
      visible: true,
    },
  ];
  const tabIndex = tabs.findIndex((tab) => tab.id === searchParameters.tab);
  const selectedIndex = tabIndex !== -1 ? tabIndex : 0;

  return (
    <>
      {archived && userCanActOnFeatureFlag ? (
        <RestoreFeatureFlagNotification
          applicationName={parameters.applicationName}
          className={styles.notification}
          featureFlagId={featureFlagId}
          featureFlagKey={parameters.featureFlagKey}
          onSuccess={revalidatePage}
        />
      ) : null}
      {!userCanActOnFeatureFlag && (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="warning"
          subtitle="The application which owns this flag is not associated to you."
          title="You do not have permission to edit this flag"
        />
      )}
      {userCanActOnFeatureFlag ? (
        <FeatureFlagDetails
          applicationName={parameters.applicationName}
          featureFlagId={featureFlagId}
          featureFlagKey={parameters.featureFlagKey}
          archived={featureFlag.archived}
          description={featureFlag.description}
          environments={flagEnvironments}
          teamName={application?.teamName}
          featureFlagType={featureFlag.type}
        />
      ) : (
        <ReadOnlyFeatureFlagDetails
          applicationName={parameters.applicationName}
          featureFlagKey={parameters.featureFlagKey}
          featureFlagId={featureFlagId}
        />
      )}
      <Tabs selectedIndex={selectedIndex}>
        <TabList aria-label="List of tabs" contained role="tablist">
          {tabs.map((tab) => tab.visible && <TabLink key={tab.id} label={tab.label} id={tab.id} />)}
        </TabList>
        <TabPanels>
          {tabs.map(
            (tab) =>
              tab.visible && (
                <TabPanel className={styles.tabPanel} key={tab.id}>
                  <Layer>{tab.content}</Layer>
                </TabPanel>
              ),
          )}
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Flag;

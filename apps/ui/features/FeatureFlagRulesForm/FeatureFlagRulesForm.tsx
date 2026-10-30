// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import type {
  FeatureFlagType,
  FlagVariationsTableColumns,
  RulesJoined,
  FeatureFlagEnvironmentsJoined,
} from 'shared-types';
import { InlineNotification, SkeletonPlaceholder, Stack } from '@carbon/react';
import {
  type SubmitEvent,
  type KeyboardEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useNavigationGuard } from 'next-navigation-guard';

import RulesList from '../RulesList/RulesList';
import featureFlagRulesFormDataToRules from '../../utils/featureFlagRulesFormDataToRules';
import groupRulesByChange from '../../utils/groupRulesByChange';
import mapIdTo from '../../utils/mapIdTo';
import revalidatePage from '../../utils/revalidatePage';
import styles from './FeatureFlagRulesForm.module.scss';
import type { PendingFeatureFlagRule } from '../../typings/rules';
import type { SegmentWithRules } from '../../typings/segments';
import updateFeatureFlagRules from '../../actions/updateFeatureFlagRules';
import { ActionStatus } from '../../typings/common';
import { FeatureFlagRulesSidebar } from '../../components/FeatureFlagRulesSidebar/FeatureFlagRulesSidebar';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { UnsavedChangesModal } from '../../components/UnsavedChangesModal/UnsavedChangesModal';
import { EnvironmentSwitcher } from '../EnvironmentSwitcher/EnvironmentSwitcher';

interface FeatureFlagRulesFormProps {
  applicationId: string;
  defaultVariationId: string;
  environments?: FeatureFlagEnvironmentsJoined[];
  environmentId: string;
  existingRules: RulesJoined[];
  featureFlagId: string;
  featureFlagType: FeatureFlagType;
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

/**
 * The form uses a server action to parse the data and communicate with the API.
 * The state tracking of rules has incomplete data since it is only used for default/initial values and is not updated
 * when inputs change unless absolutely necessary (e.g. adding/removing rules).
 */
export function FeatureFlagRulesForm({
  applicationId,
  defaultVariationId,
  environmentId,
  environments = [],
  existingRules,
  featureFlagId,
  featureFlagType,
  segments,
  variations,
}: FeatureFlagRulesFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isTransitionPending, startTransition] = useTransition();
  const validationNavGuard = useNavigationGuard({
    enabled: () => !formRef.current?.checkValidity(),
  });
  const changesNavGuard = useNavigationGuard({
    enabled: () => {
      if (!formRef.current?.checkValidity()) {
        return false;
      }

      const formData = new FormData(formRef.current || undefined);
      const rules = featureFlagRulesFormDataToRules(formData);
      const defaultVariationIdChanged =
        formData.get('defaultVariationId') !== formData.get('defaultVariationId-existing');
      const [newRules, modifiedRules, deletedRules] = groupRulesByChange(rules, existingRules);

      return !!newRules.length || !!modifiedRules.length || !!deletedRules.length || defaultVariationIdChanged;
    },
  });
  const initialState = {
    status: ActionStatus.Idle,
    errorMessage: '',
    form: {
      applicationId,
      environmentId,
      featureFlagId,
    },
  };
  const [formState, formAction, isActionPending] = useActionState(updateFeatureFlagRules, initialState);
  const [rules, setRules] = useState<PendingFeatureFlagRule[]>(existingRules);
  const variationIds = variations.map((variation) => variation.id);
  const variationsIdKey = mapIdTo(variations, 'key');
  const defaultVariationKey = variationsIdKey.get(defaultVariationId) || '';
  const normalizedEnvironments = useMemo(
    () => environments.map((environment) => ({ id: environment.environmentId, key: environment.environmentKey })),
    [environments],
  );

  function id() {
    return Math.random().toString();
  }

  function handleAddRule() {
    setRules([
      {
        conditions: [],
        environmentId,
        flagId: featureFlagId,
        id: id(),
        key: '',
        created: true,
        orderPosition: rules.length,
        serveVariationId: variationIds[0] || '',
        serveFractionalId: '',
        serveFractional: null,
      },
      ...rules,
    ]);
  }

  function handleReorderRules(fromPosition: number, toPosition: number) {
    const newRules = Array.from(rules);
    const [movedRule] = newRules.splice(fromPosition, 1);

    if (!movedRule) {
      return;
    }

    newRules.splice(toPosition, 0, movedRule);

    const updatedRules = newRules.map((rule, index) => ({
      ...rule,
      orderPosition: index,
    }));

    setRules(updatedRules);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    if (!event.currentTarget.checkValidity()) {
      if (activeElement instanceof HTMLElement) {
        activeElement.focus();
      }
      return;
    }

    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  }

  useEffect(() => {
    if (formState.status === ActionStatus.Success && !changesNavGuard.active) {
      startTransition(() => {
        revalidatePage();
      });
    }
  }, [formState.status, changesNavGuard.active]);

  useEffect(() => {
    if (formState.status === ActionStatus.Success) {
      startTransition(() => {
        formAction(undefined);
      });
    }
  }, [formState.status, formAction]);

  useEffect(() => {
    setRules(existingRules as PendingFeatureFlagRule[]);
  }, [existingRules]);

  return (
    <form action={formAction} onSubmit={handleSubmit} name="flagRules" ref={formRef} onKeyDown={handleKeyDown}>
      <Stack orientation="horizontal" gap={7} className={styles.content}>
        <div>
          <div className={styles.toolbar}>
            <EnvironmentSwitcher environments={normalizedEnvironments} environmentId={environmentId} />
          </div>
          {formState.status === ActionStatus.Error && (
            <InlineNotification
              className={styles.notification}
              hideCloseButton
              kind="error"
              subtitle={formState.errorMessage}
              title="Failed to save changes"
            />
          )}
          {isTransitionPending && !isActionPending ? (
            <SkeletonPlaceholder className={styles.skeleton} />
          ) : (
            <RulesList
              defaultVariationId={defaultVariationId}
              rules={rules}
              segments={segments}
              variations={variations}
            />
          )}
          <input type="hidden" name="applicationId" value={applicationId} readOnly />
          <input type="hidden" name="flagId" value={featureFlagId} readOnly />
          <input type="hidden" name="environmentId" value={environmentId} readOnly />
          <input type="hidden" name="rules" value={JSON.stringify(existingRules)} readOnly />
        </div>
        <FeatureFlagRulesSidebar
          applicationId={applicationId}
          className={styles.sidebar}
          defaultVariationKey={defaultVariationKey}
          environmentId={environmentId}
          featureFlagType={featureFlagType}
          onAddRule={handleAddRule}
          onReorderRules={handleReorderRules}
          rules={rules}
          segments={segments}
          variations={variations}
        >
          <SubmitButton label="Save rules" status={formState.status} disabled={changesNavGuard.active} />
        </FeatureFlagRulesSidebar>
      </Stack>
      {changesNavGuard.active ? (
        <UnsavedChangesModal
          body="If you want to keep the rule changes, the rules need to be saved."
          onClose={changesNavGuard.reject}
          onPrimaryAction={formAction}
          onPrimaryActionDone={changesNavGuard.accept}
          onSecondaryAction={changesNavGuard.accept}
          open={changesNavGuard.active}
          primaryActionLabel="Yes, save all rules"
          primaryActionStatus={formState.status}
          secondaryActionLabel="No, don't save the rules"
          title="Your rules have not been saved"
        />
      ) : null}
      {validationNavGuard.active ? (
        <UnsavedChangesModal
          body="A rule contains incomplete or invalid information and can’t be saved yet. If you leave this page now, your changes will be lost."
          onClose={validationNavGuard.reject}
          onPrimaryAction={validationNavGuard.reject}
          onSecondaryAction={validationNavGuard.accept}
          open={validationNavGuard.active}
          primaryActionType="button"
          primaryActionLabel="Stay and fix errors"
          primaryActionStatus={formState.status}
          secondaryActionLabel="Discard changes"
          title="Your rules have not been saved"
        />
      ) : null}
    </form>
  );
}
